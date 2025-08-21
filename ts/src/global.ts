import type { WXEventHandler } from "webuix";

export {};

declare global {
  var _wxEventHandler: WXEventHandler | undefined | null;

  interface Window {
    _wxEventHandler?: WXEventHandler | undefined | null;
  }
}

declare module "webuix" {
  interface WXEventMap {
    ["pty-data"]: string;
    ["pty-exit"]: number;
  }
}
