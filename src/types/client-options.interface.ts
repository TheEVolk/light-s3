import IRequest from './request.interface';
import IResponse from './response.interface';

export default interface IClientOptions {
  base: string;
  region: string;
  service: string;
  secret: string;
  keyId: string;
  request: (req: IRequest) => Promise<IResponse>;
}