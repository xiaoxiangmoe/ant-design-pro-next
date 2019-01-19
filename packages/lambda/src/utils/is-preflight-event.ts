import { APIGatewayEvent } from 'aws-lambda';

const AccessControlRequestHeaders = 'Access-Control-Request-Headers'.toLowerCase();
const AccessControlRequestMethod = 'Access-Control-Request-Method'.toLowerCase();
export function isPreflightEvent(event: APIGatewayEvent) {
  const headerKeys = Object.keys(event.headers).map(x => x.toLowerCase());
  return (
    event.httpMethod === 'OPTIONS' &&
    headerKeys.includes(AccessControlRequestMethod) &&
    headerKeys.includes(AccessControlRequestHeaders)
  );
}
