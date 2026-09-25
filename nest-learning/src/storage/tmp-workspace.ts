// storage/tmp-workspace.ts
import { mkdir, rm } from 'fs/promises';
import path from 'path';

export function workDirFor(jobId: string): string {
  return path.join(process.cwd(), 'tmp', 'jobs', String(jobId));
}

export async function createWorkDir(jobId: string): Promise<string> {
  const dir = workDirFor(jobId);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function cleanupWorkDir(jobId: string): Promise<void> {
  await rm(workDirFor(jobId), { recursive: true, force: true }).catch(() => {});
}
