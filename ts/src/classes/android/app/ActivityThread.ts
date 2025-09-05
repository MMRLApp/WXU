import type { ContextWrapper } from "../../Context";
import { JavaObject } from "../../JavaObject";

export interface ActivityThreadImpl {
  currentActivityThread(): ActivityThread;
  getApplication(): ContextWrapper;
  // getSystemContext(): any;
  // getPackageManager(): any;
  // getContentResolver(): any;
  // getMainLooper(): any;
  // getSystemService(name: string): any;
  // getSystemUiContext(): any;
  // getSystemUiService(name: string): any;
}

export class ActivityThread implements ActivityThreadImpl {
  private instance: ActivityThreadImpl;

  constructor() {
    this.instance = JavaObject.create<ActivityThreadImpl>("android.app.ActivityThread");
  }

  currentActivityThread(): ActivityThread {
    return this.instance.currentActivityThread();
  }

  getApplication() {
    return this.instance.getApplication();
  }
}
