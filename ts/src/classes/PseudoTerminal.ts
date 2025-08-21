import { WXEventHandler } from "webuix";
import type { Global, Pty, PtyInstance } from "../types";

export type EnvironmentVariables = {
  [key: string]: string | null;
};

export class PseudoTerminal {
  private readonly _instance: PtyInstance | null = null;
  private readonly _shell: string;
  private readonly _args: string[];
  private readonly _env: EnvironmentVariables;
  private readonly _eventHandler: WXEventHandler | null = null;

  constructor(shell: string, args: Array<string>, env: EnvironmentVariables) {
    this._shell = shell;
    this._args = args;
    this._env = env;

    if (window._wxEventHandler instanceof WXEventHandler) {
      this._eventHandler = window._wxEventHandler;
    } else {
      this._eventHandler = new WXEventHandler();
    }

    let impl: Pty | undefined;
    try {
      impl = window.global.require("wx:pty");
    } catch (error) {
      console.error("Failed to load pty:", error);
      return;
    }

    if (!impl || typeof impl.start !== "function") {
      console.error("Invalid pty implementation");
      return;
    }

    const _args = JSON.stringify(this._args);
    const _env = JSON.stringify(this._env);

    this._instance = impl.start(this._shell, _args, _env);
  }

  public on(name: "data", callback: (data: string) => void): void;
  public on(
    name: "exit",
    callback: (data: { code: number; signal?: string }) => void
  ): void;
  public on(name: "data" | "exit", callback: (data: any) => void): void {
    const eventMap: Record<"data" | "exit", string> = {
      data: "pty-data",
      exit: "pty-exit",
    };

    const eventType: any = eventMap[name];
    if (!eventType) {
      console.warn(`Unsupported event name: ${name}`);
      return;
    }

    if (!this._eventHandler) {
      throw new Error("WXEventHandler is not initialized");
    }

    this._eventHandler.on(window, eventType, (event: any) => {
      if (name === "data") {
        callback(event?.wx as string);
      } else if (name === "exit") {
        callback(event?.wx as { code: number; signal?: string });
      }
    });
  }

  public write(data: string): void {
    this._instance?.write(data);
  }

  public resize(cols: number, rows: number): void {
    this._instance?.resize(cols, rows);
  }

  public kill(): void {
    this._instance?.kill();
  }
}
