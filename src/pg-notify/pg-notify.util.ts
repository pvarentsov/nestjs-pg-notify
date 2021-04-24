export const isObject = (value: unknown): value is Record<string, any> => {
  return value !== null && !Array.isArray(value) && typeof value === 'object';
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
  if (isObject(error)) {
    return error.message && typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error);
  }

  return JSON.stringify(error);
};