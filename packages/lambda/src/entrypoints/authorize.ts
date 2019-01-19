// show object spread works, i.e. babel works
import { APIGatewayEvent, Handler } from 'aws-lambda';
import * as HttpStatus from 'http-status-codes';
import { validate as emailValidate } from 'isemail';
import jwt from 'jsonwebtoken';
import middy from 'middy';
import { cors } from 'middy/middlewares';
import * as querystring from 'querystring';
import { appUuid, issuer, tenantUuid } from '../config/app';
import { app_secret } from '../config/secret';
import { atob, btoa } from '../utils/abab';
import { isPreflightEvent } from '../utils/is-preflight-event';
import uuidv5 from '../utils/uuidv5';

const expires_in = 36000;

/**
 * The request is missing a required parameter, includes an
 * unsupported parameter value (other than grant type),
 * repeats a parameter, includes multiple credentials,
 * utilizes more than one mechanism for authenticating the
 * client, or is otherwise malformed.
 *
 * see {@link https://tools.ietf.org/html/rfc6749#section-5.2 }
 */
const InvalidRequest = (error_description: string) => ({
  statusCode: HttpStatus.BAD_REQUEST,
  body: JSON.stringify({
    error: 'invalid_request',
    error_description,
  }),
});

/**
 * The authorization grant type is not supported by the authorization server.
 *
 * see {@link https://tools.ietf.org/html/rfc6749#section-5.2 }
 */
const UnsupportedGrantType = (grant_type: string) => ({
  statusCode: HttpStatus.BAD_REQUEST,
  body: JSON.stringify({
    error: 'unsupported_grant_type',
    error_description: `The authorization grant type "${grant_type}" is not a is not supported by the authorization server.`,
  }),
});

/**
 * The provided authorization grant (e.g., authorization
 * code, resource owner credentials) or refresh token is
 * invalid, expired, revoked, does not match the redirection
 * URI used in the authorization request, or was issued to
 * another client.
 *
 * see {@link https://tools.ietf.org/html/rfc6749#section-5.2 }
 */
const InvalidGrant = (error_description: string) => ({
  statusCode: HttpStatus.BAD_REQUEST,
  body: JSON.stringify({
    error: 'invalid_grant',
    error_description,
  }),
});

const getTokens = (username: string, password: string) => {
  const now = Math.floor(new Date().getTime() / 1000);
  /**
   * Claims:
   *
   * JWT Registered Claim Names {@link https://tools.ietf.org/html/rfc7519#section-4.1}
   *
   * OpenID Connect Standard Claims {@link https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims}
   */
  const jwsPayload = {
    //"iss" (Issuer) Claim
    // it may include tenant id when we use some third party AD Provider
    iss: issuer,
    // (Audience) Claim
    // app id
    aud: appUuid,
    // (Issued At) Claim
    iat: now,
    // (Not Before) Claim
    nbf: now,
    // (Expiration Time) Claim
    exp: now + expires_in,
    // Subject - Identifier for the End-User at the Issuer.
    // unique for each `aud` and `user`
    // we should use uuidv1 in production instead
    sub: uuidv5(username, appUuid),
    // we should use uuidv1 in production instead
    uuid: uuidv5(username, tenantUuid), // `oid` in Azure AD id token
    email: username,
  };

  const access_token = jwt.sign(jwsPayload, app_secret);

  const refresh_token = btoa(JSON.stringify({ username, password }));
  return { access_token, refresh_token };
};

const getTokensByRefreshToken = (refresh_token: string) => {
  // Warning: we should `search db and regenerate new token`, instead.
  const { username, password } = JSON.parse(atob(refresh_token));
  return getTokens(username, password);
};
const authorizeHandler: Handler<APIGatewayEvent> = async (event, context) => {
  if (isPreflightEvent(event)) {
    return { statusCode: HttpStatus.OK };
  }
  if (event.httpMethod !== 'POST') {
    return InvalidRequest('Http Method should be POST');
  }
  if (event.body === undefined || event.body === null) {
    return InvalidRequest('body is empty');
  }
  const body = querystring.parse(event.body);

  const grant_type = body.grant_type as string;

  if (grant_type === 'refresh_token') {
    if (typeof body.refresh_token !== 'string') {
      return InvalidRequest('refresh_token should be string');
    }
    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        ...getTokensByRefreshToken(body.refresh_token),
        token_type: 'Bearer',
        expires_in,
      }),
    };
  } else if (grant_type === 'password') {
    const username = body.username as string;
    const password = body.password as string;
    if (!emailValidate(username)) {
      return InvalidGrant('Authentication failure: Invalid username');
    }
    // tslint:disable-next-line: possible-timing-attack
    if (username !== password) {
      return InvalidGrant('Authentication failure: Invalid password');
    }

    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        ...getTokens(username, password),
        token_type: 'Bearer',
        expires_in,
      }),
    };
  } else {
    return UnsupportedGrantType(grant_type);
  }
};

export const handler = middy(authorizeHandler).use(cors());
