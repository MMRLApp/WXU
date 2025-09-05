import { JavaObject } from "../classes/JavaObject";

export function JavaObjectProxy<T extends object>(className: string | null | JavaObject): T {
  let javaObj: JavaObject;

  if (className instanceof JavaObject) {
    javaObj = className;
  } else {
    javaObj = new JavaObject(className);
  }

  return new Proxy(javaObj, {
    get(target, prop, receiver) {
      if (prop === "release" || prop === "objId" || prop === "classId") {
        return Reflect.get(target, prop, receiver);
      }

      // Check if method exists via reflect (optional, can skip for dynamic)
      return (...args: any[]) => {
        // If no args, try to treat as getter
        if (args.length === 0) {
          const result = JavaObject.callMethod(target.objId, String(prop), []);
          return unwrapJavaResult(result);
        } else {
          const result = JavaObject.callMethod(target.objId, String(prop), args);
          return unwrapJavaResult(result);
        }
      };
    },
    set(target, prop, value, receiver) {
      JavaObject.setField(target.objId, String(prop), value);
      return true;
    },
  }) as T;
}

function unwrapJavaResult(value: any) {
  if (typeof value === "string" && value.startsWith("ptr:")) {
    const objId = value.slice(4);
    return JavaObjectProxy(JavaObject.fromObjId(objId));
  }
  return value;
}
