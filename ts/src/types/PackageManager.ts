/**
 * Information about an installed Android application.
 *
 * This interface represents detailed metadata about an app package,
 * including version info, directories, permissions, and various Android-specific settings.
 */
export interface WXApplicationInfo {
  /** The unique package name identifier (e.g., "com.example.app") */
  packageName: string;
  /** The internal name of the application */
  name: string | null;
  /** The human-readable label/title shown to users */
  label: string | null;
  /** The version name as a string (e.g., "1.2.3") */
  versionName: string | null;
  /** The numeric version code for programmatic comparison */
  versionCode: number;
  /** The non-localized label of the application */
  nonLocalizedLabel: string | null;
  /** The app component factory class name (Android P+) */
  appComponentFactory: string | null;
  /** The backup agent class name for app data backup */
  backupAgentName: string | null;
  /** The app category (e.g., game, productivity) */
  category: number;
  /** The main activity class name */
  className: string | null;
  /** Compatible width limit in density-independent pixels */
  compatibleWidthLimitDp: number;
  /** SDK version the app was compiled against (Android S+) */
  compileSdkVersion: number | null;
  /** Codename of the SDK version (Android S+) */
  compileSdkVersionCodename: string | null;
  /** Path to the app's private data directory */
  dataDir: string | null;
  /** Description of the application */
  description: string | null;
  /** Path to device-protected data directory */
  deviceProtectedDataDir: string | null;
  /** Whether the application is enabled */
  enabled: boolean;
  /** Various flags describing the application properties */
  flags: number;
  /** Largest width limit in density-independent pixels */
  largestWidthLimitDp: number;
  /** Activity name for managing app storage space */
  manageSpaceActivityName: string | null;
  /** Minimum SDK version required by the app */
  minSdkVersion: number;
  /** Path to the app's native library directory */
  nativeLibraryDir: string | null;
  /** Permission required to access this app's components */
  permission: string | null;
  /** Name of the process this app should run in */
  processName: string | null;
  /** Path to the publicly accessible APK file */
  publicSourceDir: string | null;
  /** Smallest screen width required in density-independent pixels */
  requiresSmallestWidthDp: number;
  /** JSON string of shared library files */
  sharedLibraryFiles: string | null;
  /** Path to the APK file */
  sourceDir: string | null;
  /** UUID of the storage volume containing the app */
  storageUuid: string | null;
  /** Target SDK version the app was designed for */
  targetSdkVersion: number;
  /** Task affinity for activity grouping */
  taskAffinity: string | null;
  /** Default theme resource ID */
  theme: number;
  /** UI mode options */
  uiOptions: number;
  /** User ID associated with this app */
  uid: number;
  /** JSON string of split APK names */
  splitNames: string | null;
  /** JSON string of split APK public source directories */
  splitPublicSourceDirs: string | null;
  /** JSON string of split APK source directories */
  splitSourceDirs: string | null;
}

/**
 * Provides access to Android package management functionality.
 *
 * This interface allows you to query information about installed applications,
 * retrieve app metadata, get application icons, and list installed packages.
 * It's essential for building tools that need to inspect or manage Android apps.
 */
export interface PackageManager {
  /**
   * Gets detailed information about a specific application package.
   *
   * @param packageName The package name to look up (e.g., "com.example.app")
   * @returns A JSON string containing WXApplicationInfo, or empty object "{}" if not found
   */
  getApplicationInfo(packageName: string): string;

  /**
   * Gets detailed information about a specific application package with flags.
   *
   * @param packageName The package name to look up
   * @param flags Additional flags to control what information is retrieved
   * @returns A JSON string containing WXApplicationInfo, or empty object "{}" if not found
   */
  getApplicationInfo(packageName: string, flags: number): string;

  /**
   * Gets detailed information about a specific application package with flags for a specific user.
   *
   * @param packageName The package name to look up
   * @param flags Additional flags to control what information is retrieved
   * @param userId The user ID to query packages for (useful for multi-user devices)
   * @returns A JSON string containing WXApplicationInfo, or empty object "{}" if not found
   */
  getApplicationInfo(
    packageName: string,
    flags: number,
    userId: number
  ): string;

  /**
   * Gets a list of all installed package names on the device.
   *
   * @returns A JSON string containing an array of package names
   */
  getInstalledPackages(): string;

  /**
   * Gets a list of all installed package names with specific flags.
   *
   * @param flags Flags to filter which packages are included in the result
   * @returns A JSON string containing an array of package names
   */
  getInstalledPackages(flags: number): string;

  /**
   * Gets a list of all installed package names for a specific user with flags.
   *
   * @param flags Flags to filter which packages are included in the result
   * @param userId The user ID to query packages for
   * @returns A JSON string containing an array of package names
   */
  getInstalledPackages(flags: number, userId: number): string;

  /**
   * Gets the application icon as a base64-encoded string.
   *
   * @param packageName The package name whose icon to retrieve
   * @returns Base64-encoded image string, or null if the icon cannot be retrieved
   */
  getApplicationIcon(packageName: string): string | null;

  /**
   * Gets the application icon as a base64-encoded string with flags.
   *
   * @param packageName The package name whose icon to retrieve
   * @param flags Additional flags for icon retrieval
   * @returns Base64-encoded image string, or null if the icon cannot be retrieved
   */
  getApplicationIcon(packageName: string, flags: number): string | null;

  /**
   * Gets the application icon as a base64-encoded string for a specific user.
   *
   * @param packageName The package name whose icon to retrieve
   * @param flags Additional flags for icon retrieval
   * @param userId The user ID to query the icon for
   * @returns Base64-encoded image string, or null if the icon cannot be retrieved
   */
  getApplicationIcon(
    packageName: string,
    flags: number,
    userId: number
  ): string | null;
}
