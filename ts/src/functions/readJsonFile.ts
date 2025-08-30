import { openInputStream } from "./openInputStream";

/**
 * Reads and parses a JSON file from the specified path.
 * @template T - The expected type of the parsed JSON object.
 * @param path - The file path to read.
 * @param encoding - The text encoding to use (default: 'utf-8').
 * @param signal - Optional AbortSignal to cancel the operation.
 * @returns A promise that resolves to the parsed JSON object of type T.
 */
export async function readJsonFile<T>(path: string, encoding: string = "utf-8", signal?: AbortSignal): Promise<T> {
  const response = await openInputStream(path, { signal });
  return await response.json();
}
