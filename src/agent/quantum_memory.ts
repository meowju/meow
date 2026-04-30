import { MeowDatabase } from "../kernel/database";
import { MeowKernel } from "../kernel/kernel";

export interface MemoryResult {
  content: string;
  metadata: Record<string, any>;
  distance: number;
}

interface DBMemoryRow {
  id: number;
  content: string;
  metadata: string;
  distance: number;
}

interface DBVectorRow {
  embedding: Buffer;
}

export class QuantumMemory {
  private db: MeowDatabase;
  private kernel: MeowKernel;
  private measuredIds: Set<number> = new Set();

  constructor(db: MeowDatabase, kernel: MeowKernel) {
    this.db = db;
    this.kernel = kernel;
  }

  /**
   * Associative Recall with Simulated Amplitude Amplification
   * Mimics Grover's Algorithm via iterative vector refinement.
   */
  public async recall(queryEmbedding: number[], iterations: number = 2): Promise<MemoryResult[]> {
    let currentEmbedding = new Float32Array(queryEmbedding);
    const rawDb = this.db.getRawDb();
    
    let topResult: any = null;

    for (let i = 0; i < iterations; i++) {
      // Phase Flip + Diffusion Simulation
      // In a real Grover iteration, we amplify the target state.
      // Here, we find the closest match and move the query vector towards it (constructive interference).
      
      const results = rawDb.prepare(`
        SELECT 
          rowid as id, 
          distance 
        FROM vec_memory 
        WHERE embedding MATCH ? 
        AND k = 1
        ORDER BY distance 
      `).all(currentEmbedding) as { id: number; distance: number }[];

      if (results.length === 0) break;
      
      topResult = results[0];
      
      // Simulation of constructive interference: Move query towards target
      // This increases the "probability amplitude" of the target match.
      const targetVec = rawDb.prepare("SELECT embedding FROM vec_memory WHERE rowid = ?").get(topResult.id) as DBVectorRow | undefined;
      if (targetVec) {
        const targetArr = new Float32Array(targetVec.embedding);
        for (let j = 0; j < currentEmbedding.length; j++) {
          currentEmbedding[j] = currentEmbedding[j] * 0.7 + targetArr[j] * 0.3;
        }
      }
    }

    // Final Measurement (Collapse)
    const finalResults = rawDb.prepare(`
      SELECT 
        v.rowid as id,
        d.content,
        d.metadata,
        v.distance
      FROM vec_memory v
      JOIN vector_memory_data d ON v.rowid = d.id
      WHERE v.embedding MATCH ?
      AND k = 5
      AND v.rowid NOT IN (${Array.from(this.measuredIds).join(',') || -1})
      ORDER BY v.distance
    `).all(currentEmbedding) as DBMemoryRow[];

    // No-Cloning Theorem: Destructive Read
    // Once measured, the memory is collapsed and cannot be cloned/read again in this state.
    for (const res of finalResults) {
      this.measuredIds.add(res.id);
    }

    return finalResults.map(r => ({
      content: r.content,
      metadata: JSON.parse(r.metadata),
      distance: r.distance
    }));
  }

  /**
   * Store new context (Unitary Evolution of State)
   */
  public store(content: string, embedding: number[], metadata: any = {}) {
    this.kernel.push({
      type: "STORE_VECTOR",
      content,
      embedding,
      metadata
    });
  }
}
