export interface Reflect {
  getClass(className: string): string | null;
  newInstance(classId: string, argsJson: string | null): string | null;
  callMethod(
    objectId: string,
    methodName: string,
    argsJson: string | null
  ): string | null;
  callStaticMethod(
    objectId: string,
    methodName: string,
    argsJson: string | null
  ): string | null;
  getField(objectId: string, fieldName: string): string | null;
  setField(objectId: string, fieldName: string, value: string): boolean;
  createProxy(interfaceName: string, methodsMapJson: string): string | null;
  releaseObject(objectId: string): boolean;
}
