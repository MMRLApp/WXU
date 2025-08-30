/**
 * Represents a stream-like interface for message-based communication.
 *
 * This interface provides methods for adding and removing event listeners for "message" events,
 * sending messages, and handling incoming messages via an optional `onmessage` property.
 *
 * @remarks
 * Implementations of this interface can be used to abstract communication channels such as
 * web workers, sockets, or other message-based transports.
 */
export interface FsStreamInterface {
  addEventListener(type: "message", listener: (event: MessageEvent) => void): void;
  removeEventListener(type: "message", listener: (event: MessageEvent) => void): void;
  postMessage(data: string | (ArrayBuffer | ArrayBufferLike)): void;
  onmessage?: ((event: MessageEvent) => void) | null;
}
