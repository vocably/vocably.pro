import { exec, type ExecOptions } from 'node:child_process';

export const execute = async (
  command: string,
  options?: ExecOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const process = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(
          new Error(`Exit Code ${error.code}: ${stderr || error.message}`)
        );
        return;
      }
      resolve(stdout.toString().trim());
    });

    // Real-time logging
    process.stdout?.on('data', (data) =>
      console.log(data.toString().trimEnd())
    );
    process.stderr?.on('data', (data) =>
      console.error(data.toString().trimEnd())
    );
  });
};
