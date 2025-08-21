/**
 * Represents a pseudo-terminal (PTY) interface for starting terminal processes.
 *
 * @since v213
 */
export interface Pty {
  /**
   * Starts a new PTY process with the specified shell, arguments, and environment variables.
   *
   * @param sh - The shell executable to run.
   * @param argsJson - A JSON string representing the arguments to pass to the shell, or `null` if no arguments.
   * @param envJson - A JSON string representing the environment variables, or `null` if no environment variables.
   * @returns A {@link PtyInstance} representing the started PTY process, or `null` if the process could not be started.
   */
  start(
    sh: String,
    argsJson: String | null,
    envJson: String | null
  ): PtyInstance | null;

  /**
   * Starts a new PTY process with the specified shell, arguments, environment variables, and terminal size.
   *
   * @param sh - The shell executable to run.
   * @param argsJson - A JSON string representing the arguments to pass to the shell.
   * @param envJson - A JSON string representing the environment variables.
   * @param cols - The number of columns for the terminal.
   * @param rows - The number of rows for the terminal.
   * @returns A {@link PtyInstance} representing the started PTY process, or `null` if the process could not be started.
   */
  start(
    sh: String,
    argsJson: String,
    envJson: String,
    cols: number,
    rows: number
  ): PtyInstance | null;
}

/**
 * @internal
 *
 * Represents an instance of a pseudo-terminal (PTY).
 * Provides methods to interact with the PTY, such as writing data,
 * killing the process, and resizing the terminal window.
 *
 * @since v213
 */
export interface PtyInstance {
  /**
   * Writes data to the PTY.
   * @param data - The string data to be written to the terminal.
   */
  write(data: String): void;

  /**
   * Terminates the PTY process.
   */
  kill(): void;

  /**
   * Resizes the PTY terminal window.
   * @param cols - The number of columns for the terminal.
   * @param rows - The number of rows for the terminal.
   */
  resize(cols: number, rows: number): void;
}
