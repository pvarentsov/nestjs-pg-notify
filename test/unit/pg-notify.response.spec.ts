import { PgNotifyResponse } from '../../src';

describe('Unit: PgNotifyResponse', () => {
  describe('success', () => {
    it('Expect it creates success response with default status', () => {
      const response = PgNotifyResponse.success({message: 'Ok'});

      expect(response.status).toEqual(200);
      expect(response.data).toEqual({message: 'Ok'});
      expect(response.error).toBeUndefined();
    });

    it('Expect it creates success response with custom status', () => {
      const response = PgNotifyResponse.success(undefined, 'Status: Ok');

      expect(response.status).toEqual('Status: Ok');
      expect(response.data).toBeUndefined();
      expect(response.error).toBeUndefined();
    });
  });

  describe('error', () => {
    it('Expect it creates error response with default status', () => {
      const response = PgNotifyResponse.error({message: 'Error'});

      expect(response.status).toEqual(500);
      expect(response.error).toEqual({message: 'Error'});
      expect(response.data).toBeUndefined();
    });

    it('Expect it creates error response with custom status', () => {
      const response = PgNotifyResponse.error('Internal Error', 'Status: Error');

      expect(response.status).toEqual('Status: Error');
      expect(response.error).toEqual('Internal Error');
      expect(response.data).toBeUndefined();
    });
  });
});