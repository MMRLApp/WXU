export interface ReadableStreamInit extends ResponseInit {
  signal?: AbortSignal;
  headers?: HeadersInit;
}
