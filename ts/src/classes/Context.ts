import { JavaObject } from "./JavaObject";
import { ActivityThread } from "./android/app/ActivityThread";

export interface ContextWrapper {
  getApplicationContext(): any;
}

export interface ContextImpl extends ContextWrapper {
  getPackageName(): string;
  getDataDir(): any;
  getCacheDir(): any;
  getExternalCacheDir(): any;
  getFilesDir(): any;
  getSystemService(name: string): any;
  getResources(): any;
  getPackageManager(): any;
  getContentResolver(): any;
  getApplicationInfo(): any;
  getAssets(): any;
  getSharedPreferences(name: string, mode: number): any;
}

/**
 * Provides access to Android application context and common context-related operations.
 * Wraps the underlying JavaObject interactions for easier use in JavaScript/TypeScript.
 */
export class Context implements ContextImpl {
  private static _instance: Context;
  private _context: ContextImpl;

  private constructor() {
    const aThread = new ActivityThread();
    // ContextWrapper is basiclly `Context`
    const application = aThread.currentActivityThread().getApplication();
    this._context = application.getApplicationContext() as ContextImpl;
  }

  public getApplicationContext() {
    return this;
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

  public getSharedPreferences(name: string, mode: number) {
    return this._context.getSharedPreferences(name, mode);
  }

  /**
   * Gets the application's package name
   */
  public getPackageName(): string {
    return this._context.getPackageName();
  }

  /**
   * Gets the application's data directory
   */
  public getDataDir(): string {
    return this._context.getDataDir();
  }

  /**
   * Gets the application's cache directory
   */
  public getCacheDir(): string {
    return this._context.getCacheDir();
  }

  /**
   * Gets the application's external cache directory (if available)
   */
  public getExternalCacheDir(): string | null | undefined {
    return this._context.getExternalCacheDir();
  }

  /**
   * Gets the application's files directory
   */
  public getFilesDir(): string {
    return this._context.getFilesDir();
  }

  /**
   * Gets the system service with the given name
   * @param serviceName The name of the system service (e.g., "window", "power")
   */
  public getSystemService(serviceName: string) {
    return this._context.getSystemService(serviceName);
  }

  /**
   * Gets the resources object for the application
   */
  public getResources() {
    return this._context.getResources();
  }

  /**
   * Gets the package manager
   */
  public getPackageManager() {
    return this._context.getPackageManager();
  }

  /**
   * Gets the content resolver
   */
  public getContentResolver() {
    return this._context.getContentResolver();
  }

  /**
   * Gets the application info
   */
  public getApplicationInfo() {
    return this._context.getApplicationInfo();
  }

  /**
   * Gets the assets manager
   */
  public getAssets() {
    return this._context.getAssets();
  }

  /**
   * Releases the underlying context resources
   */
  public release(): void {
    (this._context as unknown as JavaObject).release();
  }
}
