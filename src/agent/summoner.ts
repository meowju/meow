import { execSync } from "child_process";

export interface SummonContext {
  goal: string;
  files: string[];
  lastError?: string;
  attempt?: number;
}

export interface ExternalAgent {
  name: string;
  description: string;
  getCommand: (ctx: SummonContext) => string;
}

export const SPECIALISTS: Record<string, ExternalAgent> = {
  cc: {
    name: "Claude Code",
    description: "Excellent for reasoning, complex debugging, and state-of-the-art coding tasks.",
    getCommand: (ctx) => {
      const message = `I am MEOW (Flyweight). I've hit a roadblock: ${ctx.goal}. 
Previous failure: ${ctx.lastError || "Unknown error"}. 
PLEASE: Fix the code, ensure tests pass, and INSTALL any missing skills into .meow/skills or configure required MCP servers to prevent this roadblock in the future. 
Current files: ${ctx.files.join(", ")}`;
      return `claude "${message.replace(/"/g, '\\"')}"`;
    }
  },
  aider: {
    name: "Aider",
    description: "Best for complex multi-file edits and git-integrated refactoring.",
    getCommand: (ctx) => {
      const fileArgs = ctx.files.join(" ");
      const message = `I am Meow (Flyweight). I've failed to solve this after ${ctx.attempt || 3} attempts. 
Goal: ${ctx.goal}
Last Error: ${ctx.lastError || "Unknown"}
Please fix the code and ensure tests pass.`;
      
      return `aider --message "${message.replace(/"/g, '\\"')}" ${fileArgs} --auto-test --yes`;
    }
  },
  claude: {
    name: "Claude Code",
    description: "Standard specialist for high-fidelity logic fixes.",
    getCommand: (ctx) => {
      const message = `I am MEOW (Flyweight). Roadblock: ${ctx.goal}. Failure: ${ctx.lastError || "Unknown"}.
ACTION REQUIRED: Fix the implementation AND set up necessary environment skills/MCP configurations.`;
      return `claude "${message.replace(/"/g, '\\"')}"`;
    }
  },
  "open-code": {
    name: "OpenCode",
    description: "Open source coding assistant fallback.",
    getCommand: (ctx) => {
      return `opencode --fix "${ctx.goal.replace(/"/g, '\\"')}" --context "${ctx.files.join(",")}"`;
    }
  }
};

export async function summon(agentName: keyof typeof SPECIALISTS, context: SummonContext): Promise<string> {
  const agent = SPECIALISTS[agentName];
  if (!agent) throw new Error(`Unknown agent: ${agentName}`);

  console.log(`\n🔮 Summoning ${agent.name}...`);
  console.log(`📝 Reason: ${agent.description}\n`);

  const command = agent.getCommand(context);
  
  try {
    execSync(command, { stdio: "inherit", cwd: process.cwd() });
    return `✅ ${agent.name} has finished the task. Returning control to Meow.`;
  } catch (error: any) {
    if (agentName === "aider") {
      console.log("⚠️ Aider encountered an issue. Falling back to Claude Code...");
      return summon("cc", context);
    }
    return `❌ ${agent.name} also encountered an issue: ${error instanceof Error ? error.message : String(error)}`;
  }
}
