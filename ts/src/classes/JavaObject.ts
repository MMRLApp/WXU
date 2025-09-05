import type { Reflect } from "../types/Reflect";

/**
 * Represents a bridge to interact with Java objects from JavaScript/TypeScript.
 *
 * The `JavaObject` class provides static and instance methods to create, manipulate,
 * and release Java objects via a reflection interface, typically exposed by a
 * global context (e.g., `wx:reflect` module). It supports calling methods, accessing
 * fields, and creating Java proxies with JavaScript handlers.
 *
 * ## Usage
 *
 * - Instantiate with a Java class name and constructor arguments to create a new Java object.
 * - Use `call` to invoke Java methods, `get` and `set` to access fields.
 * - Use static methods for advanced operations or to create proxies.
 *
 * ## Static Members
 *
 * - `reflect`: The reflection interface for Java interop.
 * - `proxyHandlers`: Internal map for proxy handler functions.
 * - `nextProxyId`: Counter for generating unique proxy handler IDs.
 *
 * ## Instance Members
 *
 * - `classId`: The Java class identifier.
 * - `objId`: The Java object identifier.
 *
 * ## Methods
 *
 * - `constructor(className, args)`: Creates a new Java object.
 * - `call(method, args)`: Calls a Java method.
 * - `get(field)`: Gets a Java field value.
 * - `set(field, value)`: Sets a Java field value.
 * - `release()`: Releases the Java object.
 *
 * ## Static Methods
 *
 * - `getClass(name)`: Gets a Java class ID.
 * - `newInstance(classId, args)`: Creates a new Java object instance.
 * - `callMethod(objId, method, args)`: Calls a method on a Java object.
 * - `getField(objId, field)`: Gets a field value from a Java object.
 * - `setField(objId, field, value)`: Sets a field value on a Java object.
 * - `release(objId)`: Releases a Java object.
 * - `fromObjId(objId)`: Creates a `JavaObject` from an existing object ID.
 * - `createProxy(interfaceName, handler)`: Creates a Java proxy object with a JavaScript handler.
 *
 * @throws {Error} If the required global context or reflection module is not available.
 * @throws {TypeError} For invalid arguments in methods.
 */
export class JavaObject {
  public static reflect: Reflect | undefined;
  public static proxyHandlers: Map<any, any>;
  public static nextProxyId: number;
  public classId: any;
  public objId: any;

  static {
    if (typeof window["global"] === "undefined") {
      throw new Error("JavaObject requires a global context with 'wx:reflect' module.");
    }

    this.reflect = window.global.require("wx:reflect");
    this.proxyHandlers = new Map();
    this.nextProxyId = 0;
  }

  public constructor(className: string | null, args: Array<string | boolean | number> = []) {
    if (typeof className === "undefined") {
      throw new TypeError("Class name must be a non-empty string or null.");
    }

    if (className) {
      this.classId = JavaObject.getClass(className);
      this.objId = JavaObject.newInstance(this.classId, args);
    }
  }

  public call(method: string, args: Array<string | boolean | number> = []): string | null | undefined {
    if (typeof method !== "string" || method.length === 0) {
      throw new TypeError("Method name must be a non-empty string.");
    }

    return JavaObject.callMethod(this.objId, method, args);
  }

  public get(field: string): string | null | undefined {
    if (typeof field !== "string" || field.length === 0) {
      throw new TypeError("Field name must be a non-empty string.");
    }

    return JavaObject.getField(this.objId, field);
  }

  public set(field: string, value: string | boolean | number | null): void {
    if (typeof field !== "string" || field.length === 0) {
      throw new TypeError("Field name must be a non-empty string.");
    }

    if (value === undefined) {
      throw new TypeError("Value cannot be undefined.");
    }

    JavaObject.setField(this.objId, field, value);
  }

  public release(): void {
    JavaObject.release(this.objId);
  }

  public static getClass(name: string): string | null | undefined {
    return this.reflect?.getClass(name);
  }

  public static newInstance(classId: string, args: Array<string | boolean | number> | null): string | null | undefined {
    const jsonArgs = args == null ? "null" : JSON.stringify(args);
    return this.reflect?.newInstance(classId, jsonArgs);
  }

  public static callMethod(objId: string, method: string, args: Array<string | boolean | number> | null): string | null | undefined {
    const jsonArgs = args == null ? "[]" : JSON.stringify(args);
    return this.reflect?.callMethod(objId, method, jsonArgs);
  }

  public static callStaticMethod(objId: string, method: string, args: Array<string | boolean | number> | null): string | null | undefined {
    const jsonArgs = args == null ? "[]" : JSON.stringify(args);
    return this.reflect?.callStaticMethod(objId, method, jsonArgs);
  }

  public static getField(objId: string, field: string): string | null | undefined {
    return this.reflect?.getField(objId, field);
  }

  public static setField(objId: string, field: string, value: string | boolean | number | null): void {
    this.reflect?.setField(objId, field, String(value));
  }

  public static release(objId: string): void {
    this.reflect?.releaseObject(objId);
  }

  public static fromObjId(objId: string | null | undefined): JavaObject {
    const obj = new JavaObject(null);
    obj.objId = objId;
    return obj;
  }

  public static createProxy(interfaceName, handler) {
    const methodsMap = {};
    const handlerIds: Array<string> = [];

    const allMethods = {
      hashCode: () => 0,
      equals: () => false,
      toString: () => "[JavaScript Proxy]",
      ...handler,
    };

    for (const methodName in allMethods) {
      if (typeof allMethods[methodName] === "function") {
        const methodId = `proxy_handler_${this.nextProxyId++}`;
        methodsMap[methodName] = methodId;
        handlerIds.push(methodId);

        this.proxyHandlers.set(methodId, (...args) => {
          try {
            return allMethods[methodName](...args);
          } catch (e) {
            console.error(`Error in proxy method ${methodName}:`, e);
            if (methodName === "equals") return false;
            return null;
          }
        });
      }
    }

    const proxyId = this.reflect?.createProxy(interfaceName, JSON.stringify(methodsMap));

    const proxy = JavaObject.fromObjId(proxyId);

    (proxy as any).releaseProxy = () => {
      handlerIds.forEach((id) => this.proxyHandlers.delete(id));
      proxy.release();
    };

    return proxy;
  }

  public static create<T>(className: string | JavaObject | null, args: any[] = []): T {
    let javaObj: JavaObject;

    if (className instanceof JavaObject) {
      javaObj = className;
    } else if (className) {
      javaObj = new JavaObject(className, args);
    } else {
      throw new TypeError("Must provide a class name or a JavaObject instance");
    }

    const autoWrap = (value: any) => {
      if (value == null) {
        return value;
      }

      if (typeof value === "string") {
        let objId = value;

        if (value.startsWith("ptr:")) {
          objId = value.slice(4);
        }

        if (objId.includes("wx_reflect_obj") || objId.match(/^[a-zA-Z0-9_]+$/)) {
          try {
            return this.create(JavaObject.fromObjId(objId));
          } catch (error) {
            console.error(`Error wrapping Java object ${objId}:`, error);
            return value;
          }
        }
      }

      return value;
    };

    return new Proxy(javaObj, {
      get(target, prop: string, receiver) {
        if (prop === "release" || prop === "objId" || prop === "classId") {
          return Reflect.get(target, prop, receiver);
        }

        return (...args: any[]) => {
          try {
            const result = JavaObject.callMethod(target.objId, prop, args);
            return autoWrap(result);
          } catch (error) {
            console.error(`Error calling method ${prop}:`, error);
            throw error;
          }
        };
      },

      set(target, prop: string, value) {
        try {
          JavaObject.setField(target.objId, prop, value);
          return true;
        } catch (error) {
          console.error(`Error setting field ${prop}:`, error);
          return false;
        }
      },
    }) as T;
  }
}
