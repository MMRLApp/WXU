import { writeTextFile } from "./writeTextFile";

/**
 * Writes JSON data to a file using the output stream
 * @param path - The file path to write to
 * @param data - The JSON data to write`
 */
export async function writeJsonFile(path: string, data: any): Promise<void> {
  const json = JSON.stringify(data);
  await writeTextFile(path, json);
}
