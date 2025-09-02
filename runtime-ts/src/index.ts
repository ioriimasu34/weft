<<<<<<< HEAD
<<<<<<< HEAD
export function run() {
  console.log("runtime ts stub");
}
=======
=======
// Weft Runtime — actor kernel (Step 4)
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
export type Effect = "Db" | "Net" | "Now" | "Kms" | "Serial";

export interface CapabilityToken {
  module: string;
  effects: Effect[];
  issuedAt: number;
  devOnly?: boolean;
}

<<<<<<< HEAD
export interface ActorContext {
  cap: CapabilityToken;
}

export class ActorSystem {
  constructor() {}
  spawn<T extends object>(_actor: T) { return _actor; }
=======
export interface Message { type: string; payload?: unknown }

const hasEffect = (cap: CapabilityToken, e: Effect) => cap.effects.includes(e);
const assertEffect = (cap: CapabilityToken, e: Effect) => {
  if (!hasEffect(cap, e)) throw new Error(`Effect ${e} not granted for module ${cap.module}`);
};

// Bind capability-gated facades around low-level stubs
import * as lowDb from "./caps/db.js";
import * as lowNet from "./caps/net.js";
import * as lowNow from "./caps/now.js";
import * as lowKms from "./caps/kms.js";
import * as lowSerial from "./caps/serial.js";

export function bindCaps(cap: CapabilityToken) {
  return {
    db: { query: async (sql: string, params: unknown[] = []) => { assertEffect(cap, "Db"); return lowDb.query(sql, params); } },
    net: { get: async (url: string) => { assertEffect(cap, "Net"); return lowNet.get(url); } },
    now: { now: () => { assertEffect(cap, "Now"); return lowNow.now(); } },
    kms: { decrypt: async (c: string) => { assertEffect(cap, "Kms"); return lowKms.decrypt(c); } },
    serial: { readLine: async () => { assertEffect(cap, "Serial"); return lowSerial.readLine(); } }
  };
}

export interface ActorContext {
  cap: CapabilityToken;
  system: ActorSystem;
  caps: ReturnType<typeof bindCaps>;
  now(): number;
}

export interface Actor {
  name: string;
  init?(ctx: ActorContext): Promise<void> | void;
  onMessage(ctx: ActorContext, msg: Message): Promise<void> | void;
  onCrash?(ctx: ActorContext, err: unknown): "resume" | "restart" | "stop";
}

class Mailbox {
  private q: Message[] = [];
  private busy = false;
  constructor(private handle: (m: Message) => Promise<void>, private max = 1024) {}
  send(m: Message) { if (this.q.length >= this.max) throw new Error("mailbox overflow"); this.q.push(m); this.flush(); }
  private async flush() {
    if (this.busy) return; this.busy = true;
    try { while (this.q.length) { const m = this.q.shift()!; await this.handle(m); } }
    finally { this.busy = false; }
  }
}

type RestartPolicy = { maxRestarts: number; windowMs: number; backoffMs: number };
const DEFAULT_POLICY: RestartPolicy = { maxRestarts: 3, windowMs: 60_000, backoffMs: 250 };

type LiveActor = {
  actor: Actor; cap: CapabilityToken; ctx: ActorContext; mbox: Mailbox;
  crashes: number[]; // timestamps
};

export class ActorSystem {
  private actors = new Map<string, LiveActor>();
  constructor(private policy: RestartPolicy = DEFAULT_POLICY) {}

  issueToken(module: string, effects: Effect[], devOnly = false): CapabilityToken {
    return { module, effects, issuedAt: Date.now(), devOnly };
  }

  spawn(actor: Actor, cap: CapabilityToken) {
    if (this.actors.has(actor.name)) throw new Error(`actor ${actor.name} already exists`);
    const ctx: ActorContext = { cap, system: this, caps: bindCaps(cap), now: () => Date.now() };
    const live: LiveActor = {
      actor, cap, ctx,
      mbox: new Mailbox((m) => this.dispatch(live, m)),
      crashes: []
    };
    this.actors.set(actor.name, live);
    if (actor.init) Promise.resolve(actor.init(ctx)).catch((e)=>this.handleCrash(live, e));
    return { name: actor.name, send: (msg: Message)=> live.mbox.send(msg), stop: ()=> this.stop(actor.name) };
  }

  private async dispatch(live: LiveActor, msg: Message) {
    try { await live.actor.onMessage(live.ctx, msg); }
    catch (e) { await this.handleCrash(live, e); }
  }

  private async handleCrash(live: LiveActor, err: unknown) {
    const action = live.actor.onCrash?.(live.ctx, err) ?? "restart";
    if (action === "resume") return;
    if (action === "stop") { this.stop(live.actor.name); return; }

    const now = Date.now();
    live.crashes = live.crashes.filter(ts => now - ts <= this.policy.windowMs);
    live.crashes.push(now);
    if (live.crashes.length > this.policy.maxRestarts) { this.stop(live.actor.name); return; }

    await new Promise(r => setTimeout(r, this.policy.backoffMs));
    // Re-run init
    if (live.actor.init) await Promise.resolve(live.actor.init(live.ctx));
  }

  stop(name: string) { this.actors.delete(name); }
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
}

export * as db from "./caps/db.js";
export * as net from "./caps/net.js";
export * as now from "./caps/now.js";
export * as kms from "./caps/kms.js";
export * as serial from "./caps/serial.js";
export * as verify from "./security/verify.js";
<<<<<<< HEAD
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
=======
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
