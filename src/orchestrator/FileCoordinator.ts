// File write conflict prevention

import { FileArtifact } from './Task';

export interface FileLock {
  taskId: string;
  path: string;
  acquiredAt: number;
}

export interface FileCoordinationResult {
  allowed: boolean;
  conflicts: string[];
  grantedLocks: FileLock[];
}

export class FileCoordinator {
  private locks: Map<string, FileLock> = new Map();

  requestAccess(taskId: string, artifacts: FileArtifact[]): FileCoordinationResult {
    const conflicts: string[] = [];
    const grantedLocks: FileLock[] = [];

    for (const artifact of artifacts) {
      const existingLock = this.locks.get(artifact.path);

      if (existingLock && existingLock.taskId !== taskId) {
        // Any existing write lock blocks this task
        conflicts.push(
          `Task ${taskId} wants to access ${artifact.path}, but ${existingLock.taskId} is already writing it`
        );
        continue;
      }

      const lock: FileLock = {
        taskId,
        path: artifact.path,
        acquiredAt: Date.now(),
      };
      this.locks.set(artifact.path, lock);
      grantedLocks.push(lock);
    }

    return {
      allowed: conflicts.length === 0,
      conflicts,
      grantedLocks,
    };
  }

  wouldConflict(taskId: string, artifacts: FileArtifact[]): string[] {
    const conflicts: string[] = [];

    for (const artifact of artifacts) {
      const existingLock = this.locks.get(artifact.path);

      if (existingLock && existingLock.taskId !== taskId) {
        conflicts.push(`${artifact.path} is held by ${existingLock.taskId}`);
      }
    }

    return conflicts;
  }

  release(taskId: string): void {
    for (const [path, lock] of this.locks) {
      if (lock.taskId === taskId) {
        this.locks.delete(path);
      }
    }
  }

  getLockedFiles(): Map<string, FileLock> {
    return new Map(this.locks);
  }

  releaseStaleLocks(maxAgeMs: number): string[] {
    const now = Date.now();
    const stale: string[] = [];

    for (const [path, lock] of this.locks) {
      if (now - lock.acquiredAt > maxAgeMs) {
        this.locks.delete(path);
        stale.push(path);
      }
    }

    return stale;
  }
}