import { FsPermissionError } from "../classes/FsPermissionError";
import { FsStreamError } from "../classes/FsStreamError";
import type { ReadableStreamInit } from "../interfaces/ReadableStreamInit";

// Default configuration for readable streams
export const readableStreamInit: ReadableStreamInit = {
  headers: {
    "Content-Type": "application/octet-stream",
  },
} as const;

/**
 * Opens an input stream for reading files from the filesystem
 * @param path - The file path to read from
 * @param init - Optional configuration for the readable stream
 * @returns Promise that resolves to a Response object containing the file data
 */
export async function openInputStream(path: string, init: ReadableStreamInit = {}): Promise<Response> {
  // Validate input parameters
  if (typeof path !== "string") {
    throw new TypeError("'path' must be a string");
  }

  if (typeof path === "string" && path.trim() === "") {
    throw new Error("'path' cannot be empty");
  }

  // Check if the FsInputStream interface is available
  if (!window.FsInputStream || typeof window.FsInputStream.postMessage !== "function") {
    throw new FsPermissionError("INPUT");
  }

  const mergedInit: ReadableStreamInit = {
    ...readableStreamInit,
    ...init,
  };

  return new Promise<Response>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    let aborted = false;
    let messageHandler: ((event: MessageEvent) => void) | null = null;

    const onAbort = (): void => {
      aborted = true;
      cleanup();
      reject(new DOMException("The operation was aborted.", "AbortError"));
    };

    // Handle abort signal
    if (mergedInit.signal?.aborted) {
      onAbort();
      return;
    }

    mergedInit.signal?.addEventListener("abort", onAbort);

    const cleanup = (): void => {
      if (mergedInit.signal) {
        mergedInit.signal.removeEventListener("abort", onAbort);
      }
      if (messageHandler && window.FsInputStream) {
        window.FsInputStream.removeEventListener("message", messageHandler);
        window.FsInputStream.onmessage = null;
      }
    };

    messageHandler = (event: MessageEvent): void => {
      if (aborted) return;

      const msg: unknown = event.data;

      if (msg instanceof ArrayBuffer) {
        chunks.push(new Uint8Array(msg));
      } else if (typeof msg === "string") {
        cleanup();
        reject(new FsStreamError(msg, "STREAM_ERROR"));
        return;
      } else {
        cleanup();
        reject(new FsStreamError("Received unexpected message type", "INVALID_MESSAGE"));
        return;
      }

      // Create the readable stream once we have data
      try {
        const stream = new ReadableStream<Uint8Array>({
          start(controller): void {
            try {
              for (const chunk of chunks) {
                controller.enqueue(chunk);
              }
              controller.close();
            } catch (error) {
              controller.error(error);
              throw error;
            }
          },
          cancel(reason?: unknown): void {
            console.warn("Stream canceled:", reason);
            cleanup();
          },
        });

        cleanup();
        resolve(new Response(stream, mergedInit));
      } catch (error) {
        cleanup();
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    // Set up message listener and send request
    window.FsInputStream?.addEventListener("message", messageHandler);

    try {
      window.FsInputStream?.postMessage(path);
    } catch (error) {
      cleanup();
      reject(new FsStreamError(`Failed to send message to FsInputStream: ${error}`, "POST_MESSAGE_ERROR"));
    }
  });
}
