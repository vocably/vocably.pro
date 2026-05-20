// @ts-ignore
import { glob } from 'node:fs/promises';
export const listFiles = async (pattern: string): Promise<string[]> => {
  const files: string[] = [];
  for await (const file of glob(pattern)) {
    files.push(file);
  }
  return files;
};
