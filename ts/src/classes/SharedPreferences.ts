import { Context } from "./Context";
import { JavaObject } from "./JavaObject";

export type PreferenceValue = boolean | number | string;

export type ChangeListener = (key: string, prefs: SharedPreferences) => void;

export class SharedPreferences {
  #prefsId: any;
  #editorId: any | null = null;
  #listeners: Map<string, ChangeListener> = new Map();
  #listenerProxy: JavaObject | null = null;

  constructor(context: Context, name: string, mode: number = 0) {
    if (!(context instanceof Context)) {
      throw new TypeError("Context must be an instance of Context class.");
    }

    this.#prefsId = context.getSharedPreferences(name, mode);
    if (!this.#prefsId) {
      throw new Error("Failed to get SharedPreferences instance.");
    }
  }

  #getEditor(): any {
    if (!this.#editorId) {
      this.#editorId = JavaObject.callMethod(this.#prefsId, "edit", []);
    }
    return this.#editorId;
  }

  get(key: string, defaultValue: PreferenceValue): PreferenceValue {
    const type = typeof defaultValue;
    switch (type) {
      case "boolean":
        return JavaObject.callMethod(this.#prefsId, "getBoolean", [key, defaultValue]) == "true";
      case "number":
        if (Number.isInteger(defaultValue)) {
          const int = JavaObject.callMethod(this.#prefsId, "getInt", [key, defaultValue]);
          const parsedInt = Number.parseInt(int!!);
          if (Number.isNaN(parsedInt)) {
            return defaultValue;
          }
          return parsedInt;
        }
        const float = JavaObject.callMethod(this.#prefsId, "getFloat", [key, defaultValue]);
        const parsedFloat = Number.parseFloat(float!!);
        if (Number.isNaN(parsedFloat)) {
          return defaultValue;
        }
        return parsedFloat;
      case "string":
        return JavaObject.callMethod(this.#prefsId, "getString", [key, defaultValue]) as PreferenceValue;
      default:
        return JavaObject.callMethod(this.#prefsId, "getString", [key, String(defaultValue)]) as PreferenceValue;
    }
  }

  put(key: string, value: PreferenceValue): this {
    const editor = this.#getEditor();
    const type = typeof value;
    switch (type) {
      case "boolean":
        JavaObject.callMethod(editor, "putBoolean", [key, value]);
        break;
      case "number":
        Number.isInteger(value) ? JavaObject.callMethod(editor, "putInt", [key, value]) : JavaObject.callMethod(editor, "putFloat", [key, value]);
        break;
      case "string":
        JavaObject.callMethod(editor, "putString", [key, value]);
        break;
      default:
        JavaObject.callMethod(editor, "putString", [key, String(value)]);
    }
    return this;
  }

  remove(key: string): this {
    JavaObject.callMethod(this.#getEditor(), "remove", [key]);
    return this;
  }

  clear(): this {
    JavaObject.callMethod(this.#getEditor(), "clear", []);
    return this;
  }

  commit(): boolean {
    if (!this.#editorId) return false;
    const result = JavaObject.callMethod(this.#editorId, "commit", []);
    this.#editorId = null;
    return result == "true";
  }

  apply(): void {
    if (!this.#editorId) return;
    JavaObject.callMethod(this.#editorId, "apply", []);
    this.#editorId = null;
  }

  contains(key: string): boolean {
    return JavaObject.callMethod(this.#prefsId, "contains", [key]) == "true";
  }

  //   getAll(): Record<string, any> {
  //     return JavaObject.callMethod(this.#prefsId, "getAll", []);
  //   }

  registerOnChangeListener(callback: ChangeListener): () => boolean {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    const listenerId = `listener_${Math.random().toString(36).substring(2, 9)}`;
    this.#listeners.set(listenerId, callback);

    if (!this.#listenerProxy) {
      const interfaceName = "android.content.SharedPreferences$OnSharedPreferenceChangeListener";
      this.#listenerProxy = JavaObject.createProxy(interfaceName, {
        onSharedPreferenceChanged: (prefsId: any, key: string) => {
          this.#listeners.forEach((listener) => {
            try {
              listener(key, this);
            } catch (e) {
              console.error("Error in preference change listener:", e);
            }
          });
        },
      });

      JavaObject.callMethod(this.#prefsId, "registerOnSharedPreferenceChangeListener", [this.#listenerProxy.objId]);
    }

    return () => this.unregisterOnChangeListener(listenerId);
  }

  unregisterOnChangeListener(listenerId: string): boolean {
    if (this.#listeners.delete(listenerId) && this.#listeners.size === 0 && this.#listenerProxy) {
      JavaObject.callMethod(this.#prefsId, "unregisterOnSharedPreferenceChangeListener", [this.#listenerProxy.objId]);
      (this.#listenerProxy as any)?.releaseProxy();
      this.#listenerProxy = null;
      return true;
    }
    return false;
  }
}
