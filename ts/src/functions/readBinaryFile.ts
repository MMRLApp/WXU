import { openInputStream } from "./openInputStream";

/**
 * Reads a file as an array buffer using the input stream
 * @param path - The file path to read
 * @param signal - Optional abort signal
 * @returns Promise that resolves to the file content as ArrayBuffer
 */
export async function readBinaryFile(path: string, signal?: AbortSignal): Promise<ArrayBuffer> {
  const response = await openInputStream(path, { signal });
  return await response.arrayBuffer();
}
