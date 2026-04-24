import { exec, type ExecOptions } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

export const execute = async (
  command: string,
  options?: ExecOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const process = exec(
      command,
      { ...{ maxBuffer: 1024 * 1024 * 100 }, ...options },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(`Exit Code ${error.code}: ${stderr || error.message}`)
          );
          return;
        }
        resolve(stdout.toString().trim());
      }
    );

    // Real-time logging
    process.stdout?.on('data', (data) =>
      console.log(data.toString().trimEnd())
    );
    process.stderr?.on('data', (data) =>
      console.error(data.toString().trimEnd())
    );
  });
};

export const listFiles = async (dir: string): Promise<string[]> => {
  try {
    // Read recursively. Items are file names relative to 'dir'.
    const entries = await readdir(dir, { recursive: true });
    const filePaths = [];

    // Check each entry to ensure it's a file
    for (const entry of entries) {
      const fullPath = join(dir, entry);

      // Use stat() to get file type information
      const stats = await stat(fullPath);

      if (stats.isFile()) {
        filePaths.push(fullPath); // Push the path relative to the start folder
      }
    }

    return filePaths;
  } catch (err) {
    console.error(`Error reading directory: ${err}`);
    return [];
  }
};
