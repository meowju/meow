import * as p from "@clack/prompts";
import pc from "picocolors";
import { Agent } from "../agent/agent";
import { resolve } from "path";
import { SPECIALISTS, summon } from "../agent/summoner";
import { DEFAULT_TOOLS } from "../types/tool";

export function createRepl(agent: Agent) {
  return {
    async start() {
      process.stdout.write("\x1Bc"); // Clear terminal
      
      console.log(pc.bold(pc.cyan("MEOW")) + pc.dim(" | ") + pc.white("Lightweight AI Coding Agent"));
      console.log(pc.dim("Sovereign Mode: Commands, Files, Escalation Active\n"));

      while (true) {
        const input = await p.text({
          message: pc.bold(pc.cyan(">>")),
          placeholder: "",
          validate(value) {
            if (!value || value.length === 0) return "Please enter a message";
          },
        });

        if (p.isCancel(input)) {
          console.log(pc.dim("\nGoodbye!"));
          process.exit(0);
        }

        const text = input as string;

        // Handle Commands
        if (text.startsWith("/")) {
          const [cmd, ...args] = text.slice(1).split(" ");
          const argString = args.join(" ");

          switch (cmd) {
            case "exit":
            case "quit":
              console.log(pc.dim("Goodbye!"));
              process.exit(0);
              break;

            case "clear":
              process.stdout.write("\x1Bc");
              agent.clearHistory();
              console.log(pc.bold(pc.cyan("MEOW")) + pc.dim(" | ") + pc.white("Context Cleared\n"));
              break;

            case "help":
              console.log(pc.bold("\nCommands:"));
              console.log(pc.cyan("  /add <file>    ") + pc.dim("- Add file to context"));
              console.log(pc.cyan("  /drop <file>   ") + pc.dim("- Remove file from context"));
              console.log(pc.cyan("  /files         ") + pc.dim("- List files in context"));
              console.log(pc.cyan("  /clear         ") + pc.dim("- Clear context and screen"));
              console.log(pc.cyan("  /exit          ") + pc.dim("- Exit REPL\n"));
              break;

            case "files":
              const files = agent.getFiles();
              if (files.length === 0) {
                console.log(pc.yellow("No files in context."));
              } else {
                console.log(pc.bold("\nFiles in Context:"));
                files.forEach(f => console.log(pc.dim(`  - ${f}`)));
                console.log("");
              }
              break;

            default:
              console.log(pc.red(`Unknown command: /${cmd}`));
          }
          continue;
        }

        const s = p.spinner();
        s.start(pc.dim("Thinking..."));
        
        try {
          const response = await agent.chat(
            text, 
            false, 
            undefined, 
            (status) => s.message(pc.dim(status))
          );
          s.stop(pc.dim("Done"));

          // Premium Response Rendering
          console.log("");
          console.log(pc.bold(pc.cyan("┌── MEOW ───────────────────────────────────────────────────")));
          
          const coloredResponse = response
            .replace(/^# (.*)/gm, (_, m) => pc.bold(pc.cyan(m)))
            .replace(/^## (.*)/gm, (_, m) => pc.bold(pc.white(m)))
            .replace(/\*\*(.*?)\*\*/g, (_, m) => pc.bold(pc.white(m)))
            .replace(/`(.*?)`/g, (_, m) => pc.yellow(m));

          console.log(coloredResponse.split("\n").map(line => pc.bold(pc.cyan("│  ")) + line).join("\n"));
          console.log(pc.bold(pc.cyan("└───────────────────────────────────────────────────────────")));
          console.log("");

        } catch (err) {
          s.stop(pc.red("Error"));
          console.log(pc.red(String(err)));
        }
      }
    },
  };
}