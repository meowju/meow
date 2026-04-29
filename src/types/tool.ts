// Tool type for available agent tools

export interface Tool {
  name: string;
  description: string;
  execute: (args: string, agent?: any) => Promise<string>;
}

export const DEFAULT_TOOLS: Tool[] = [
  {
    name: "read",
    description: "Read file contents",
    execute: async (path: string) => {
      const { readFile } = await import("fs/promises");
      return readFile(path, "utf-8");
    },
  },
  {
    name: "write",
    description: "Write file contents",
    execute: async (args: string) => {
      const [path, content] = args.split("|");
      const { writeFile } = await import("fs/promises");
      await writeFile(path, content);
      return "Written successfully";
    },
  },
  {
    name: "run",
    description: "Execute a shell command or script",
    execute: async (cmd: string) => {
      const { execSync } = await import("child_process");
      try {
        const output = execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
        return output || "(Command executed with no output)";
      } catch (e: any) {
        return `Command Failed:\nSTDOUT: ${e.stdout}\nSTDERR: ${e.stderr}\nError: ${e.message}`;
      }
    },
  },
  {
    name: "grep",
    description: "Search in files (local)",
    execute: async (args: string) => {
      const [pattern, dir] = args.split("|");
      const { execSync } = await import("child_process");
      // Try git grep first, fallback to findstr/grep
      const isWin = process.platform === "win32";
      const cmd = `git grep -n "${pattern}" ${dir || "."}`;
      try {
        return execSync(cmd, { encoding: "utf-8" });
      } catch (e) {
        const fallback = isWin 
          ? `findstr /s /i /c:"${pattern}" ${dir || "."}\\*` 
          : `grep -rn "${pattern}" ${dir || "."}`;
        try {
          return execSync(fallback, { encoding: "utf-8" });
        } catch (e2) {
          return "No matches found.";
        }
      }
    },
  },
  {
    name: "browse",
    description: "Read content from a URL",
    execute: async (url: string) => {
      try {
        const response = await fetch(url.trim());
        const text = await response.text();
        return text.substring(0, 5000) + (text.length > 5000 ? "\n... [Truncated]" : "");
      } catch (e: any) {
        return `Error browsing ${url}: ${e.message}`;
      }
    },
  },
  {
    name: "search",
    description: "Search the web (Google/DDG style)",
    execute: async (query: string) => {
      try {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
        const response = await fetch(url);
        const data = await response.json() as any;
        let result = `Web results for: ${query}\n\n`;
        if (data.AbstractText) result += `Summary: ${data.AbstractText}\n\n`;
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          result += "Related Topics:\n";
          data.RelatedTopics.slice(0, 5).forEach((t: any) => {
            if (t.Text) result += `- ${t.Text} (${t.FirstURL})\n`;
          });
        }
        return result || "No relevant web results found.";
      } catch (e: any) {
        return `Error searching web for ${query}: ${e.message}`;
      }
    },
  },
  {
    name: "ls",
    description: "List files in a directory",
    execute: async (dir: string) => {
      const { execSync } = await import("child_process");
      // Try git ls-files first
      try {
        return execSync(`git ls-files ${dir || "."}`, { encoding: "utf-8" });
      } catch (e) {
        const isWin = process.platform === "win32";
        const cmd = isWin ? `dir /b ${dir || "."}` : `ls ${dir || "."}`;
        try {
          return execSync(cmd, { encoding: "utf-8" });
        } catch (e2) {
          return `Error: ${e2}`;
        }
      }
    },
  },
  {
    name: "diff",
    description: "Show uncommitted changes in the repo",
    execute: async () => {
      const { execSync } = await import("child_process");
      try {
        return execSync("git diff", { encoding: "utf-8" });
      } catch (e) {
        return "No changes or not a git repo.";
      }
    },
  },
  {
    name: "use_skill",
    description: "Load and use a specific skill (expertise/workflow)",
    execute: async (name: string, agent?: any) => {
      if (!agent || !agent.skillManager) return "Skill system not initialized.";
      const skill = agent.skillManager.getSkill(name);
      if (!skill) return `Skill '${name}' not found.`;
      
      agent.messages.push({
        role: "user",
        content: `ACTIVATE SKILL: ${skill.name}\n\nExpertise/Workflow:\n${skill.content}\n\nPlease follow these instructions for the current task.`
      });
      return `Skill '${name}' activated and injected into context.`;
    },
  },
  {
    name: "mcp_list",
    description: "List available tools from all connected MCP servers",
    execute: async (_: string, agent?: any) => {
      if (!agent || !agent.mcpManager) return "MCP system not initialized.";
      const tools = await agent.mcpManager.listAllTools();
      if (tools.length === 0) return "No MCP tools available.";
      return tools.map((t: any) => `[${t.server}] ${t.name}: ${t.description}`).join("\n");
    },
  },
  {
    name: "mcp_call",
    description: "Call a tool from an MCP server (args: server|tool|JSON_args)",
    execute: async (args: string, agent?: any) => {
      if (!agent || !agent.mcpManager) return "MCP system not initialized.";
      const [server, tool, jsonArgs] = args.split("|");
      try {
        const parsedArgs = jsonArgs ? JSON.parse(jsonArgs) : {};
        const result = await agent.mcpManager.callTool(server, tool, parsedArgs);
        return JSON.stringify(result, null, 2);
      } catch (e: any) {
        return `Error calling MCP tool ${server}:${tool}: ${e.message}`;
      }
    },
  },
];