export function toTime(time: string) {
  const value = new Date(time);
  return value.toLocaleTimeString();
}
