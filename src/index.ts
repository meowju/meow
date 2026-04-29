#!/usr/bin/env bun
// MEOW - Lightweight AI Coding Agent

import { config } from "./config/env";
import { Agent } from "./agent/agent";
import { createRepl } from "./cli/repl";

async function main() {
  const agent = new Agent({
    model: config.model,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  const repl = createRepl(agent);
  await repl.start();
}

main().catch(console.error);