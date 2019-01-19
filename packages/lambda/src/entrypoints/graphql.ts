import { APIGatewayEvent } from 'aws-lambda';
import * as HttpStatus from 'http-status-codes';
import middy, { IHandlerLambda, IMiddyMiddlewareFunction } from 'middy';
import { cors } from 'middy/middlewares';
import server from '../graphql/server';
import { isPreflightEvent } from '../utils/is-preflight-event';

const preflightResponse: IMiddyMiddlewareFunction = (
  // tslint:disable-next-line: no-shadowed-variable
  handler: IHandlerLambda<APIGatewayEvent>,
  next,
) => {
  if (isPreflightEvent(handler.event)) {
    // tslint:disable-next-line: no-any
    (handler.response as any).statusCode = HttpStatus.OK;
  }
  next();
};
export const handler = middy(server.createHandler())
  .after(preflightResponse)
  .use(
    cors({
      headers: 'Content-Type, Authorization',
    }),
  );
