export const atob = (data: string) =>
  Buffer.from(data, 'base64').toString('ascii');

export const btoa = (data: string) =>
  Buffer.from(data, 'ascii').toString('base64');
