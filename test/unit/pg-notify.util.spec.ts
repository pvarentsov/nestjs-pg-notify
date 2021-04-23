import { getReplyPattern, isObject, parseErrorMessage } from '../../src/pg-notify/pg-notify.util';

describe('Unit: PgNotifyUtil', () => {
  describe('isObject', () => {
    class TestClass {}

    it('Expect it returns truthy result for all values', () => {
      expect(isObject({answer: 42})).toBeTruthy();
      expect(isObject(new TestClass())).toBeTruthy();
    });

    it('Expect it returns falsy result for all values', () => {
      expect(isObject([])).toBeFalsy();
      expect(isObject(42)).toBeFalsy();
      expect(isObject('42')).toBeFalsy();
      expect(isObject(null)).toBeFalsy();
      expect(isObject(undefined)).toBeFalsy();
      expect(isObject(Symbol(''))).toBeFalsy();
      expect(isObject(() => false)).toBeFalsy();
    });
  });

  describe('getReplyPattern', () => {
    it('Expect it returns reply pattern', () => {
      expect(getReplyPattern('greeting')).toEqual('greeting.reply');
    });
  });

  describe('parseErrorMessage', () => {
    const message = 'Error message';

    it('When error is Error instance, expect it returns value of "message" property', () => {
      expect(parseErrorMessage(new Error(message))).toEqual(message);
    });

    it('When error is string, expect it returns error value', () => {
      expect(parseErrorMessage(message)).toEqual(message);
    });

    it('When error is object with string "message" property, expect it returns value of "message" property', () => {
      expect(parseErrorMessage({message})).toEqual(message);
    });

    it('When error structure is not standard, expect it stringifies error value', () => {
      expect(parseErrorMessage({text: message})).toEqual(JSON.stringify({text: message}));
      expect(parseErrorMessage({message: {message}})).toEqual(JSON.stringify({message: {message}}));
      expect(parseErrorMessage([])).toEqual(JSON.stringify([]));
      expect(parseErrorMessage(1)).toEqual(JSON.stringify(1));
    });
  });
});