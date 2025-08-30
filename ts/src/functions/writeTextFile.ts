import { openOutputStream } from "./openOutputStream";

/**
 * Writes text to a file using the output stream
 * @param path - The file path to write to
 * @param text - The text content to write
 * @param encoding - Text encoding (default: 'utf-8')
 */
export async function writeTextFile(path: string, text: string, encoding: string = "utf-8"): Promise<void> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const stream = openOutputStream(path);
  const writer = stream.getWriter();

  try {
    await writer.write(data);
  } finally {
    await writer.close();
  }
}
