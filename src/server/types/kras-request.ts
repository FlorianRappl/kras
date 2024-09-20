import type FormData from 'form-data';
import type { IncomingHttpHeaders } from 'http';

export interface KrasRequestQuery {
  [key: string]: string | Array<string>;
}

export interface BasicKrasRequest {
  /**
   * The URL used for the request.
   */
  url: string;
  /**
   * The target path of the request.
   */
  target: string;
  /**
   * The query parameters of the request.
   */
  query: KrasRequestQuery;
  /**
   * The method to trigger the request.
   */
  method: string;
  /**
   * The headers used for the request.
   */
  headers: IncomingHttpHeaders;
  /**
   * The content of the request.
   */
  content: string | FormData;
  /**
   * The raw content of the request.
   */
  rawContent: Buffer;
  /**
   * The form data, in case a form was given.
   */
  formData?: FormData;
}

export interface KrasRequest extends BasicKrasRequest {
  /**
   * Indicates if the request has been encrypted.
   */
  encrypted: boolean;
  /**
   * The remote address triggering the request.
   */
  remoteAddress: string;
  /**
   * The port used for the request.
   */
  port: string;
}
