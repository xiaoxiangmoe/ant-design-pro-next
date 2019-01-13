import uuidv5 from '../utils/uuidv5';

/**
 * Identity Platform instance
 * for example: https://login.partner.microsoftonline.cn
 */
const identityPlatformInstance =
  'https://ant-design-pro-next.netlify.com/.netlify/functions';
const identityPlatformInstanceUuid = uuidv5(
  identityPlatformInstance,
  uuidv5.URL,
);

const tenantName = 'xiaoxiangmoe';
/**
 * stand for company, group, etc.
 */
export const tenantUuid = uuidv5(tenantName, identityPlatformInstanceUuid);

/**
 * issuer
 *
 * The issuer of the token
 *
 * issuer: a person or company that supplies, publishes, or makes something available
 */
export const issuer = 'https://the-identity-platform-url/' + tenantUuid;

const appName = 'ant-design-pro-next';
export const appUuid = uuidv5(appName, tenantUuid);
