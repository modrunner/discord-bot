import { setTimeout as sleep } from 'node:timers/promises';
import { type Dispatcher, request as fetch } from 'undici';
import logger from '../logger.js';
import { DefaultRestClientOptions } from './utils/constants.js';
import { parseHeader, parseResponse, shouldRetry } from './utils/utils.js';

export interface RestClientOptions {
  agent: Dispatcher;
  api: string;
  headers: Record<string, string>;
  key: string | null;
  offset: number;
  retries: number;
  version: string;
}

export type RouteLike = `/${string}`;

export interface APIRequest {
  route: RouteLike;
  headers?: Record<string, string>;
  body?: unknown;
  query?: URLSearchParams;
}

export const enum RequestMethod {
  Get = 'GET',
  Post = 'POST',
}

export class RestClient {
  private limit = Number.POSITIVE_INFINITY;
  private remaining = 1;
  private reset = -1;

  public readonly options: RestClientOptions;

  public constructor(options: Partial<RestClientOptions> = {}) {
    this.options = { ...DefaultRestClientOptions, ...options };
  }

  public async get(request: APIRequest) {
    return await this.request(RequestMethod.Get, request);
  }

  public async post(request: APIRequest) {
    return await this.request(RequestMethod.Post, request);
  }

  private get limited(): boolean {
    return this.remaining <= 0 && Date.now() < this.reset;
  }

  private async request(method: RequestMethod, request: APIRequest) {
    const response = await this.raw(method, request);
    return parseResponse(response);
  }

  private async raw(method: RequestMethod, request: APIRequest, retries = 0): Promise<Dispatcher.ResponseData> {
    if (this.limited) await sleep(this.reset - Date.now());

    this.remaining--;

    let res: Dispatcher.ResponseData;
    try {
      res = await fetch(`${this.options.api}/v${this.options.version}${request.route}`, {
        headers: { ...request.headers },
        method: method,
        //body: request.body ?? null,
        //query: request.query ?? null,
      });
    } catch (error: unknown) {
      if (!(error instanceof Error)) throw error;

      if (shouldRetry(error) && retries !== this.options.retries) {
        return await this.raw(method, request, ++retries);
      }

      throw error;
    }

    const limit = parseHeader(res.headers['x-ratelimit-limit']);
    const remaining = parseHeader(res.headers['x-ratelimit-remaining']);
    const reset = parseHeader(res.headers['x-ratelimit-reset']);

    this.limit = limit ? Number(limit) : Number.POSITIVE_INFINITY;
    this.remaining = remaining ? Number(remaining) : 1;
    this.reset = reset ? Number(reset) * 1_000 + Date.now() + this.options.offset : Date.now();

    if (res.statusCode >= 400 && res.statusCode < 500) {
      logger.warn(
        [
          `Unexpected invalid request: recieved code ${res.statusCode}`,
          ` API    : ${this.options.api}`,
          `	Route  : ${request.route}`,
          ` Method : ${method}`,
        ].join('\n')
      );
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res;
    } else if (res.statusCode === 429) {
      logger.warn(
        [
          `Encountered unexpected 429 rate limit`,
          ` API         : ${this.options.api}`,
          `	Route       : ${request.route}`,
          ` Method      : ${method}`,
          ` Limit       : ${this.limit}`,
          ` Remaining   : ${this.remaining}`,
          ` Retry After : ${this.reset.toLocaleString()}`,
        ].join('\n')
      );

      // Not a serverside issue, so don't increment retries counter (next should succeed)
      return this.raw(method, request, retries);
    } else if (res.statusCode >= 500 && res.statusCode < 600) {
      if (retries !== this.options.retries) {
        return this.raw(method, request, ++retries);
      }

      throw new Error('this error is TODO (when out of retries for making requests)');
    } else {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        throw new Error('this error is TODO (ya fucked up a request somehow)');
      }

      return res;
    }
  }
}
