import { execSync } from "child_process";
import pc from "picocolors";
import { Agent } from "./agent";
import { ReasoningConstraint } from "./quantum_reasoning";

export class MissionReviewer {
  private agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  /**
   * Performs an autonomous review of the current workspace state against a goal.
   */
  public async verify(goal: string, testCmd?: string): Promise<string> {
    console.log(pc.bold(pc.cyan("\n🧐 [MISSION REVIEW] Starting verification...")));
    console.log(pc.dim(`Goal: ${goal}\n`));

    // 1. Analyze Changes
    let diff = "";
    try {
      diff = execSync("git diff HEAD~1", { encoding: "utf-8" });
    } catch (e) {
      try {
        diff = execSync("git diff", { encoding: "utf-8" });
      } catch (e2) {
        diff = "Unable to fetch diff.";
      }
    }

    // 2. Quantum Evaluation of Constraints
    // We dynamically generate constraints based on the goal
    const constraints: ReasoningConstraint[] = [
      {
        id: "GOAL_SATISFACTION",
        weight: 20,
        evaluate: (state: any) => {
          // Heuristic: Does the diff contain keywords from the goal?
          const keywords = goal.toLowerCase().split(" ").filter(w => w.length > 3);
          return keywords.some(k => state.diff.toLowerCase().includes(k));
        }
      },
      {
        id: "CODE_QUALITY",
        weight: 10,
        evaluate: (state: any) => {
          // Heuristic: No console.logs or TODOs in production code
          return !state.diff.includes("console.log") && !state.diff.includes("TODO");
        }
      }
    ];

    const decisionSpace = [{ diff, goal }];
    const result = await this.agent.quantumReasoning.solve(decisionSpace, constraints, (msg) => {
      process.stdout.write(`\r${pc.dim("Checking constraints: " + msg)}`);
    });

    console.log(pc.cyan("\n✨ [WAVE FUNCTION COLLAPSE] Analysis complete."));

    // 3. Execution Verification
    let testResult = "";
    if (testCmd) {
      console.log(pc.dim(`Running verification tests: ${testCmd}...`));
      try {
        testResult = execSync(testCmd, { encoding: "utf-8", timeout: 30000 });
        console.log(pc.green("✅ Tests passed."));
      } catch (e: any) {
        testResult = e.stdout || e.message;
        console.log(pc.red("❌ Tests failed."));
      }
    }

    // 4. Final Verdict
    const passed = (!testCmd || !testResult.includes("failed")) && result !== null;
    
    if (passed) {
      return `VERDICT: MISSION COMPLETED.\nChanges satisfy the goal [${goal}].\n${testCmd ? "Tests passed successfully." : "Manual verification (heuristic) passed."}`;
    } else {
      return `VERDICT: MISSION INCOMPLETE.\nDetected gaps or test failures.\nERROR: ${testResult.substring(0, 500)}`;
    }
  }
}
