/**
 * Defines an interface for retrieving path information specific
 * to a Magisk module's environment.
 *
 * This interface is crucial for a module to dynamically locate its own files,
 * access shared Magisk directories, and manage its configuration in the
 * correct locations as dictated by the Magisk framework.
 */
export interface Module {
  /**
   * Gets the unique identifier of the module.
   * This ID is defined in the module's `module.prop` file and is used as the
   * directory name within the main Magisk modules directory.
   *
   * @example
   * // returns "my-custom-module"
   * const id = currentModule.getId();
   *
   * @returns {string} The unique ID of this module.
   */
  getId(): string;

  /**
   * Gets the path to the main Magisk working directory, typically located at
   * `/data/adb`. This directory contains core Magisk files, post-fs-data scripts,
   * service scripts, and the modules directory.
   *
   * @returns {string} The absolute path to the Magisk `adb` directory.
   */
  getAdbDir(): string;

  /**
   * Gets the path to the directory where module configurations are stored.
   * This is often a subdirectory within the module's own directory to keep
   * user settings and configurations.
   *
   * @returns {string} The absolute path to the configuration directory.
   */
  getConfigDir(): string;

  /**
   * Gets the path to the configuration directory specific to this module.
   * This provides a standardized location for the module to read and write its
   * own settings, ensuring it doesn't conflict with other modules.
   * This is typically `/data/adb/modules/<module_id>/config` or similar.
   *
   * @returns {string} The absolute path to this module's config directory.
   */
  getModuleConfigDir(): string;

  /**
   * Gets the path to the directory where all installed Magisk modules are located.
   * This is the parent directory for all individual module folders.
   * The standard path is `/data/adb/modules`.
   *
   * @returns {string} The absolute path to the main Magisk modules directory.
   */
  getModulesDir(): string;

  /**
   * Gets the path to the root directory of this specific module.
   * All of the module's files (system replacements, scripts, assets) are
   * contained within this directory. The path is typically
   * `/data/adb/modules/<module_id>`.
   *
   * @returns {string} The absolute path to this module's root directory.
   */
  getModuleDir(): string;

  /**
   * Gets the path to a directory that can be used to serve web content,
   * if the module has a WebView component or a web-based UI.
   * This would point to the directory containing the module's HTML, CSS,
   * and JavaScript files.
   *
   * @returns {string} The absolute path to the module's web assets root directory.
   */
  getWebRootDir(): string;

  /**
   * Gets the path to the module's `system` directory.
   * Files placed in this directory will systemlessly overlay the corresponding
   * files in the device's actual `/system` partition. For example, a file at
   * `<moduleDir>/system/app/MyGreatApp.apk` would appear at `/system/app/MyGreatApp.apk`.
   *
   * @returns {string} The absolute path to the module's system overlay directory.
   */
  getSystemDir(): string;

  /**
   * Gets the path to the `module.prop` file for this module.
   * This file contains critical metadata about the module, such as its `id`,
   * `name`, `version`, `author`, and `description`.
   *
   * @returns {string} The absolute path to the `module.prop` file.
   */
  getPropFile(): string;
}
