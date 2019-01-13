import * as uuidInterfaces from 'uuid/interfaces';

const uuidv5: uuidInterfaces.v5 & {
  readonly DNS: string;
  readonly URL: string;
} = require('uuid/v5');

export default uuidv5;
