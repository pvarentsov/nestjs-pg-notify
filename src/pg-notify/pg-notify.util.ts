export const isObject = (value: unknown): value is Record<string, any> => {
  return value !== null && typeof value === 'object';
};

export const getReplyPattern = (pattern: string): string => {
  return `${pattern}.reply`;
};

export const parseErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }

  return JSON.stringify(error);
};