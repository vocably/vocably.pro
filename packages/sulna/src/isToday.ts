export const isToday = (ts: number, now = new Date()): boolean => {
  const tsDate = new Date(ts);

  return (
    now.getDay() === tsDate.getDay() &&
    now.getMonth() === tsDate.getMonth() &&
    now.getFullYear() === tsDate.getFullYear()
  );
};
