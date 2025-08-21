import type { Module } from "./Module";
import type { PackageManager } from "./PackageManager";
import type { Process } from "./Process";
import type { Pty } from "./Pty";
import type { Reflect } from "./Reflect";
import type { FileSystem } from "./FileSystem";

export interface Global {
  require(
    module: string
  ): FileSystem | Reflect | Process | Module | PackageManager | Pty | null;
}
