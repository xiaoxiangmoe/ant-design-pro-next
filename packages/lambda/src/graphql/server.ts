import { ApolloServer } from 'apollo-server-lambda';
import { APIGatewayEvent, Handler } from 'aws-lambda';
import AuthDirectives from 'graphql-directive-auth';
import jwt from 'jsonwebtoken';
import { app_secret } from '../config/secret';
import mocks from './mocks';
import resolvers from './resolvers';
import typeDefs from './schema';

export type BasicContext = { readonly event: APIGatewayEvent };
export type AuthContext = {
  readonly auth: {
    readonly iss: string;
    readonly aud: string;
    readonly iat: number;
    readonly nbf: number;
    readonly exp: number;
    readonly sub: string;
    readonly uuid: string;
    readonly email: string;
    readonly ver: string;
  };
};
// tslint:disable
class AuthError extends Error {
  code: number;

  constructor(message = 'Error occured', code = 400) {
    super(message);

    this.code = code;
  }
}
// tslint:enable

const customAuth = AuthDirectives({
  authenticateFunc(ctx: BasicContext) {
    const authorization = ctx.event.headers['Authorization'.toLowerCase()];
    if (!authorization) {
      throw new AuthError('Not authorized!', 401);
    }
    const secret = process.env.APP_SECRET;
    if (!secret) {
      throw new Error(
        'Secret not provided, please provide `APP_SECRET` with your token',
      );
    }
    const token = authorization.replace('Bearer ', '');
    try {
      return jwt.verify(token, secret);
    } catch (e) {
      throw new AuthError('Invalid token!', 401);
    }
  },
});
process.env.APP_SECRET = app_secret;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  mocks,
  mockEntireSchema: false,
  context({ event }: BasicContext) {
    return { event };
  },
  schemaDirectives: {
    ...customAuth,
  },
});

export default server;
