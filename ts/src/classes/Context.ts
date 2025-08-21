import { JavaObject } from "./JavaObject";

/**
 * Provides access to Android application context and common context-related operations.
 * Wraps the underlying JavaObject interactions for easier use in JavaScript/TypeScript.
 */
export class Context {
  private static _instance: Context;
  private _context: JavaObject;

  private constructor() {
    // Initialize the base context using ActivityThread
    const ActivityThread = new JavaObject("android.app.ActivityThread");
    const thread = ActivityThread.call("currentActivityThread");
    const context = JavaObject.callMethod(thread!!, "getApplication", []);
    this._context = JavaObject.fromObjId(
      JavaObject.callMethod(context!!, "getApplicationContext", [])
    );
  }

  /**
   * Gets the singleton instance of the Context wrapper
   */
  public static get instance(): Context {
    if (!Context._instance) {
      Context._instance = new Context();
    }
    return Context._instance;
  }

  /**
   * Gets the underlying JavaObject representing the Android context
   */
  public get native(): JavaObject {
    return this._context;
  }

  /**
   * Gets the application's package name
   */
  public get packageName(): string {
    return this._context.call("getPackageName", []) as string;
  }

  /**
   * Gets the application's data directory
   */
  public get dataDir(): string {
    return this._context.call("getDataDir", []) as string;
  }

  /**
   * Gets the application's cache directory
   */
  public get cacheDir(): string {
    return this._context.call("getCacheDir", []) as string;
  }

  /**
   * Gets the application's external cache directory (if available)
   */
  public get externalCacheDir(): string | null | undefined {
    return this._context.call("getExternalCacheDir", []);
  }

  /**
   * Gets the application's files directory
   */
  public get filesDir(): string {
    return this._context.call("getFilesDir", []) as string;
  }

  /**
   * Gets the system service with the given name
   * @param serviceName The name of the system service (e.g., "window", "power")
   */
  public getSystemService(serviceName: string): JavaObject | null {
    const serviceId = this._context.call("getSystemService", [serviceName]);
    return serviceId ? JavaObject.fromObjId(serviceId) : null;
  }

  /**
   * Gets the resources object for the application
   */
  public get resources(): JavaObject | null {
    const resourcesId = this._context.call("getResources", []);
    return resourcesId ? JavaObject.fromObjId(resourcesId) : null;
  }

  /**
   * Gets the package manager
   */
  public get packageManager(): JavaObject | null {
    const pmId = this._context.call("getPackageManager", []);
    return pmId ? JavaObject.fromObjId(pmId) : null;
  }

  /**
   * Gets the content resolver
   */
  public get contentResolver(): JavaObject | null {
    const crId = this._context.call("getContentResolver", []);
    return crId ? JavaObject.fromObjId(crId) : null;
  }

  /**
   * Gets the application info
   */
  public get applicationInfo(): JavaObject | null {
    const aiId = this._context.call("getApplicationInfo", []);
    return aiId ? JavaObject.fromObjId(aiId) : null;
  }

  /**
   * Gets the assets manager
   */
  public get assets(): JavaObject | null {
    const assetsId = this._context.call("getAssets", []);
    return assetsId ? JavaObject.fromObjId(assetsId) : null;
  }

  /**
   * Releases the underlying context resources
   */
  public release(): void {
    this._context.release();
  }
}
