export const listFiles = async (pattern: string): Promise<string[]> => {
  const { glob } = await import('node:fs/promises');
  const files: string[] = [];
  for await (const file of glob(pattern)) {
    files.push(file);
  }
  return files;
};
