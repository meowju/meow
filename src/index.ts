#!/usr/bin/env bun
// MEOW - Lightweight AI Coding Agent

import { config } from "./config/env";
import { Agent } from "./agent/agent";
import { createRepl } from "./cli/repl";
import { MeowDatabase } from "./kernel/database";
import { MeowKernel } from "./kernel/kernel";

async function main() {
  const db = new MeowDatabase();
  const kernel = new MeowKernel(db);
  kernel.start();

  const agent = new Agent({
    model: config.model,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    db,
    kernel
  });

  const repl = createRepl(agent);
  await repl.start();
}

main().catch(console.error);