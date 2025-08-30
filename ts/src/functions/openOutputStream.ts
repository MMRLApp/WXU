import { FsPermissionError } from "../classes/FsPermissionError";
import { FsStreamError } from "../classes/FsStreamError";

/**
 * Opens an output stream for writing files to the filesystem
 * @param path - The file path to write to
 * @returns WritableStream for writing data to the file
 */
export function openOutputStream(path: string): WritableStream<Uint8Array> {
  // Validate input parameters
  if (typeof path !== "string") {
    throw new TypeError("'path' must be a string");
  }

  if (path.trim() === "") {
    throw new Error("'path' cannot be empty");
  }

  // Check if the FsOutputStream interface is available
  if (!window.FsOutputStream || typeof window.FsOutputStream.postMessage !== "function") {
    throw new FsPermissionError("OUTPUT");
  }

  let pathSet = false;
  let isAborted = false;

  /**
   * Helper function to send a message and wait for a reply
   */
  const postMessageWithReply = (message: string | (ArrayBuffer | ArrayBufferLike)): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (isAborted) {
        reject(new DOMException("Stream has been aborted", "AbortError"));
        return;
      }

      const handler = (event: MessageEvent): void => {
        const data: unknown = event.data;

        if (window.FsOutputStream) {
          window.FsOutputStream.removeEventListener("message", handler);
        }

        if (typeof data === "string") {
          if (data.startsWith("Failed")) {
            reject(new FsStreamError(data, "OPERATION_FAILED"));
          } else {
            resolve(data);
          }
        } else {
          reject(new FsStreamError("Received non-string response", "INVALID_RESPONSE"));
        }
      };

      if (!window.FsOutputStream) {
        reject(new FsPermissionError("OUTPUT"));
        return;
      }

      window.FsOutputStream.addEventListener("message", handler);

      try {
        window.FsOutputStream.postMessage(message);
      } catch (error) {
        window.FsOutputStream.removeEventListener("message", handler);
        reject(new FsStreamError(`Failed to send message: ${error}`, "POST_MESSAGE_ERROR"));
      }
    });
  };

  return new WritableStream<Uint8Array>({
    async start(): Promise<void> {
      try {
        const reply = await postMessageWithReply(path);
        if (reply !== "Path set") {
          throw new FsStreamError(`Failed to set path: ${reply}`, "PATH_SET_FAILED");
        }
        pathSet = true;
      } catch (error) {
        throw error instanceof FsStreamError ? error : new FsStreamError(`Failed to initialize output stream: ${error}`, "INIT_ERROR");
      }
    },

    async write(chunk: Uint8Array): Promise<void> {
      if (isAborted) {
        throw new DOMException("Stream has been aborted", "AbortError");
      }

      if (!(chunk instanceof Uint8Array)) {
        throw new TypeError("Chunk must be Uint8Array");
      }

      if (!pathSet) {
        throw new FsStreamError("Path not set before writing chunk", "PATH_NOT_SET");
      }

      try {
        await postMessageWithReply(chunk.buffer);
        console.log(`Chunk written: ${chunk.length} bytes`);
      } catch (error) {
        throw error instanceof FsStreamError ? error : new FsStreamError(`Failed to write chunk: ${error}`, "WRITE_ERROR");
      }
    },

    async close(): Promise<void> {
      console.log("WritableStream closed");
      // await postMessageWithReply('CLOSE');
    },

    abort(reason?: unknown): void {
      isAborted = true;
      console.warn("WritableStream aborted:", reason);
      // try {
      //   postMessageWithReply('ABORT');
      // } catch (error) {
      //   console.warn('Failed to send abort message:', error);
      // }
    },
  });
}
