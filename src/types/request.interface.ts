export default class IRequest {
  method: string;
  url: string;
  body?: any;
  headers: Record<string, string>;
}