// Error types for better error handling
export class FsStreamError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "FsStreamError";
  }
}
