import { Agent } from "./agent";
import { MissionReviewer } from "./mission_reviewer";
import pc from "picocolors";

export interface EvolveOptions {
  maxIterations: number;
  runTests: boolean;
  testCmd?: string;
  onStatus?: (status: string) => void;
}

export class EvolveHarness {
  private agent: Agent;
  private reviewer: MissionReviewer;

  constructor(agent: Agent) {
    this.agent = agent;
    this.reviewer = new MissionReviewer(agent);
  }

  /**
   * The Meta-Orchestration Loop. 
   * Continuously iterates until the work is verified as "Done" and "Correct".
   */
  public async execute(goal: string, options: EvolveOptions): Promise<string> {
    let iteration = 0;
    let isCoherent = false;
    let lastReviewVerdict = "";

    console.log(pc.bold(pc.magenta(`\n🌀 [EVOLVE] Starting autonomous evolution loop for goal: ${goal}`)));

    while (iteration < options.maxIterations && !isCoherent) {
      iteration++;
      options.onStatus?.(`Iteration ${iteration}/${options.maxIterations}: Reasoning...`);

      // 1. Perform Agent Turn
      // We inject the previous review failure as "System Pressure" if it exists
      const turnInput = iteration === 1 
        ? goal 
        : `ATTENTION: Your previous attempt failed verification. 
           VERDICT: ${lastReviewVerdict}
           REMAINING GOAL: ${goal}
           ACTION: Fix the logic gaps and unfinished work. DO NOT report success until ALL logic is implemented.`;

      const response = await this.agent.chat(turnInput, options.runTests, options.testCmd, options.onStatus);

      // 2. Perform Logic Audit (The Liar Check)
      options.onStatus?.(`Iteration ${iteration}: Verifying logic...`);
      lastReviewVerdict = await this.reviewer.verify(goal, options.testCmd);

      if (lastReviewVerdict.includes("MISSION COHERENT")) {
        isCoherent = true;
        console.log(pc.bold(pc.green(`\n✨ [EVOLVE] Goal achieved and verified in ${iteration} iterations.`)));
      } else {
        console.log(pc.yellow(`\n⚠️ [EVOLVE] Verification failed (Iteration ${iteration}). Restarting loop with feedback...`));
        // Add a small delay to prevent rapid-fire API calls if something is looping
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!isCoherent) {
      return `❌ [EVOLVE] Failed to reach coherence after ${options.maxIterations} iterations.\nLast Review: ${lastReviewVerdict}`;
    }

    return `✅ Mission Complete.\n${lastReviewVerdict}`;
  }
}
