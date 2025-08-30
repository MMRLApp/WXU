import { openInputStream } from "./openInputStream";

/**
 * Reads a file as text using the input stream
 * @param path - The file path to read
 * @param encoding - Text encoding (default: 'utf-8')
 * @param signal - Optional abort signal
 * @returns Promise that resolves to the file content as text
 */
export async function readTextFile(path: string, encoding: string = "utf-8", signal?: AbortSignal): Promise<string> {
  const response = await openInputStream(path, { signal });
  return await response.text();
}
