export const safeStringify = (variable: any): string => {
  try {
    return JSON.stringify(variable);
  } catch (e) {
    return e.toString();
  }
};
