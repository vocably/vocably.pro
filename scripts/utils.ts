import { type BatchJob } from '@google/genai';
import { type Result } from '@vocably/model';
import { readFileSync } from 'fs';
import { exec, type ExecOptions } from 'node:child_process';
import { writeFileSync } from 'node:fs';

export const checkEnvironment = () => {
  console.log(`AWS_PROFILE: ${process.env.AWS_PROFILE}`);
  console.log(`UNITS_OF_SPEECH bucket: ${process.env.UNITS_OF_SPEECH_BUCKET}`);

  if (process.env.UNITS_OF_SPEECH_BUCKET !== 'vocably-prod-units-of-speech') {
    console.log('This is a non-prod environment. Skipping sync.');
    process.exit(1);
  }
};

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

export const listFiles = async (pattern: string): Promise<string[]> => {
  const { glob } = await import('node:fs/promises');
  const files: string[] = [];
  for await (const file of glob(pattern)) {
    files.push(file);
  }
  return files;
};

export const readJobs = (): BatchJob[] => {
  return readFileSync('./jobs.jsonl')
    .toString()
    .split('\n')
    .filter((j) => j.length > 0)
    .map((j) => JSON.parse(j));
};

export const addJob = (job: BatchJob): Result<unknown> => {
  const jobs = readJobs();
  writeFileSync(
    './jobs.jsonl',
    [...jobs, job].map((j) => JSON.stringify(j)).join('\n')
  );
  return {
    success: true,
    value: null,
  };
};

export const updateJob = (job: BatchJob): Result<unknown> => {
  const jobs = readJobs();
  const existingJob = jobs.find((j) => j.name === job.name);

  if (!existingJob) {
    return {
      success: false,
      reason: `Can't find a job with name ${job.name}`,
    };
  }

  writeFileSync(
    './jobs.jsonl',
    jobs
      .map((j) => {
        if (j === existingJob) {
          return job;
        } else {
          return j;
        }
      })
      .map((j) => JSON.stringify(j))
      .join('\n')
  );

  return {
    success: true,
    value: null,
  };
};
