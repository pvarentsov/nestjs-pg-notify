export const isObject = (value: unknown): value is Record<string, any> => {
  return value !== null && typeof value === 'object';
};

export const getReplyPattern = (pattern: string): string => {
  return `${pattern}.reply`;
};