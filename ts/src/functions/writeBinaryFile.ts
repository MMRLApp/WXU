import { openOutputStream } from "./openOutputStream";

/**
 * Writes binary data to a file using the output stream
 * @param path - The file path to write to
 * @param data - The binary data to write
 */
export async function writeBinaryFile(path: string, data: ArrayBuffer | Uint8Array): Promise<void> {
  const uint8Data = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

  const stream = openOutputStream(path);
  const writer = stream.getWriter();

  try {
    await writer.write(uint8Data);
  } finally {
    await writer.close();
  }
}
