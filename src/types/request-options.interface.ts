import IClientOptions from './client-options.interface';

export interface IBaseRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  key: string;
  client: IClientOptions;
  buffer?: Buffer;
}

export interface IInternalRequestOptions {
  headers: Record<string, string>;
  timestamp: Date;
  expires: number;
  service: 's3';
  query: URLSearchParams;
}

type IRequestOptions = IBaseRequestOptions & Partial<IInternalRequestOptions>;
type INormalizedRequestOptions = IBaseRequestOptions & IInternalRequestOptions;

export default IRequestOptions;
export { INormalizedRequestOptions };