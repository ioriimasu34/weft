<<<<<<< HEAD
export function run() {
  console.log("runtime ts stub");
}
=======
export type Effect = "Db" | "Net" | "Now" | "Kms" | "Serial";

export interface CapabilityToken {
  module: string;
  effects: Effect[];
  issuedAt: number;
  devOnly?: boolean;
}

export interface ActorContext {
  cap: CapabilityToken;
}

export class ActorSystem {
  constructor() {}
  spawn<T extends object>(_actor: T) { return _actor; }
}

export * as db from "./caps/db.js";
export * as net from "./caps/net.js";
export * as now from "./caps/now.js";
export * as kms from "./caps/kms.js";
export * as serial from "./caps/serial.js";
export * as verify from "./security/verify.js";
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
