import { FsStreamError } from "./FsStreamError";

export class FsPermissionError extends FsStreamError {
  constructor(streamType: "INPUT" | "OUTPUT") {
    super(
      `Unable to find the "window.Fs${streamType === "INPUT" ? "InputStream" : "OutputStream"}" interface. ` +
        `Did you forget to add "wxu.permission.FS_${streamType}_STREAM" to your permissions inside config.json?`,
      "PERMISSION_ERROR"
    );
  }
}
