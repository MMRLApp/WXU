import type { Module } from "./Module";
import type { PackageManager } from "./PackageManager";
import type { Process } from "./Process";
import type { Pty } from "./Pty";
import type { Reflect } from "./Reflect";
import type { FileSystem } from "./FileSystem";
import type { WXEventHandler } from "webuix";

export interface GlobalModules {
  fs: FileSystem;
  reflect: Reflect;
  process: Process;
  module: Module;
  pty: Pty;
  pm: PackageManager;
}

export interface Global {
  require<K extends keyof GlobalModules>(
    module: K | `wx:${K}`
  ): GlobalModules[K] | undefined;
}

export {};

declare global {
  var _wxEventHandler: WXEventHandler | undefined | null;

  interface Window {
    global: Global | null;
    pm: PackageManager | null;
    fs: FileSystem | null;
    process: Process | null;
    module: Module | null;
    pty: Pty | null;
    _wxEventHandler?: WXEventHandler | undefined | null;
  }
}

declare module "webuix" {
  interface WXEventMap {
    ["pty-data"]: string;
    ["pty-exit"]: number;
  }
}
