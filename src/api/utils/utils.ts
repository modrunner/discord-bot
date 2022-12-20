import { type Dispatcher } from 'undici';

export function parseHeader(header: string[] | string | undefined): string | undefined {
  if (header === undefined || typeof header === 'string') {
    return header;
  }

  return header.join(';');
}

export async function parseResponse(res: Dispatcher.ResponseData): Promise<unknown> {
  const header = parseHeader(res.headers['content-type']);
  if (header?.startsWith('application/json')) {
    return res.body.json();
  }

  return res.body.arrayBuffer();
}

export function shouldRetry(error: Error | NodeJS.ErrnoException) {
  // Retry for possible timed out requests
  if (error.name === 'AbortError') return true;
  // Downlevel ECONNRESET to retry as it may be recoverable
  return ('code' in error && error.code === 'ECONNRESET') || error.message.includes('ECONNRESET');
}
