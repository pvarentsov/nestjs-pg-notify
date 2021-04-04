export const isObject = (value: unknown): value is Record<string, any> => {
  return value !== null && typeof value === 'object';
};