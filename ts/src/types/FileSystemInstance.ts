/**
 * Defines an interface representing an instance of a file or directory.
 * The methods operate directly on the path associated with this instance. All
 * operations are synchronous and will block execution until they complete.
 */
export interface FileSystemInstance {
  /**
   * Reads the entire content of the file associated with this instance.
   *
   * @returns {string | null} The content of the file as a UTF-8 string, or `null` if reading fails.
   */
  readTextSync(): string | null;

  /**
   * Writes a string to the file associated with this instance.
   *
   * @param {string} text - The content to write.
   * @returns {void | null} Returns `null` if the operation fails.
   */
  writeTextSync(text: string): void | null;

  /**
   * Lists the files and directories if this instance represents a directory.
   *
   * @param {string} [delimiter] - An optional delimiter to join the names.
   * @returns {string | null} A string containing the names of the items in the directory,
   * or `null` if this instance is not a directory.
   */
  listSync(): string | null;
  listSync(delimiter: string): string | null;

  /**
   * Checks if the file or directory of this instance exists.
   *
   * @returns {boolean} `true` if it exists, `false` otherwise.
   */
  existsSync(): boolean;

  /**
   * Checks if this instance represents a regular file.
   *
   * @returns {boolean} `true` if it is a file, `false` otherwise.
   */
  isFileSync(): boolean;

  /**
   * Checks if this instance represents a directory.
   *
   * @returns {boolean} `true` if it is a directory, `false` otherwise.
   */
  isDirectorySync(): boolean;

  /**
   * Checks if this instance represents a symbolic link.
   *
   * @returns {boolean} `true` if it is a symbolic link, `false` otherwise.
   */
  isSymlinkSync(): boolean;

  /**
   * Checks if this instance points to a block device.
   *
   * @returns {boolean} `true` if it is a block device, `false` otherwise.
   */
  isBlockSync(): boolean;

  /**
   * Checks if this instance points to a named pipe (FIFO).
   *
   * @returns {boolean} `true` if it is a named pipe, `false` otherwise.
   */
  isNamedPipeSync(): boolean;

  /**
   * Checks if this instance points to a character device.
   *
   * @returns {boolean} `true` if it is a character device, `false` otherwise.
   */
  isCharacterSync(): boolean;

  /**
   * Checks if the file or directory of this instance is hidden.
   *
   * @returns {boolean} `true` if it is hidden, `false` otherwise.
   */
  isHiddenSync(): boolean;

  /**
   * Checks if this instance points to a socket.
   *
   * @returns {boolean} `true` if it is a socket, `false` otherwise.
   */
  isSocketSync(): boolean;

  /**
   * Creates a directory at the path of this instance.
   *
   * @returns {boolean} `true` on success, `false` otherwise.
   */
  mkdirSync(): boolean;

  /**
   * Creates a directory at the path of this instance, including parent directories.
   *
   * @returns {boolean} `true` on success, `false` otherwise.
   */
  mkdirsSync(): boolean;

  /**
   * Removes the file or directory of this instance.
   *
   * @returns {boolean} `true` on success, `false` otherwise.
   */
  rmSync(): boolean;

  /**
   * Returns the size of the file of this instance in bytes.
   *
   * @returns {number | null} The size in bytes, or `null` if it's not a file.
   */
  sizeSync(): number | null;

  /**
   * Renames or moves the file or directory of this instance.
   *
   * @param {string} newPath - The new path for the file or directory.
   * @returns {boolean} `true` on success, `false` otherwise.
   */
  renameSync(newPath: string): boolean;

  /**
   * Copies the file of this instance to a new destination.
   *
   * @param {string} dest - The destination file path.
   * @param {boolean} [overwrite=false] - If `true`, overwrite the destination if it exists.
   */
  copyFileSync(dest: string): void;
  copyFileSync(dest: string, overwrite: boolean): void;

  /**
   * Retrieves status information about the file of this instance.
   *
   * @returns {number | null} The last modification time (e.g., in milliseconds since epoch),
   * or `null` on failure.
   */
  statSync(): number | null;

  /**
   * Creates a new, empty file at the path of this instance.
   *
   * @returns {boolean} `true` if the file was created, `false` if it already exists.
   */
  createNewFileSync(): boolean;

  /**
   * Checks if the application can execute the file of this instance.
   *
   * @returns {boolean} `true` if executable, `false` otherwise.
   */
  canExecuteSync(): boolean;

  /**
   * Checks if the application can write to the file of this instance.
   *
   * @returns {boolean} `true` if writable, `false` otherwise.
   */
  canWriteSync(): boolean;

  /**
   * Checks if the application can read the file of this instance.
   *
   * @returns {boolean} `true` if readable, `false` otherwise.
   */
  canReadSync(): boolean;

  /**
   * Changes the owner and group of the file or directory.
   *
   * @param {number} uid - The user ID.
   * @param {number} gid - The group ID.
   * @returns {boolean} `true` on success, `false` otherwise.
   */
  chownSync(uid: number, gid: number): boolean;

  /**
   * Changes the permissions of the file or directory (e.g., using octal notation).
   *
   * @param {number} mode - The permission mode.
   * @returns {boolean} `true` on success, `false` otherwise.
   */
  chmodSync(mode: number): boolean;
}
