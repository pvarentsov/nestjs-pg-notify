import { PgNotifyContext } from '../../src';

describe('Unit: PgNotifyContext', () => {
  it('Expect it creates context with string channel', () => {
    const context = new PgNotifyContext(33765, 'greeting', {message: 'Hello'}, 'Request #1');

    expect(context.getProcessId()).toEqual(33765);
    expect(context.getChannel()).toEqual('greeting');
    expect(context.getData()).toEqual({message: 'Hello'});
    expect(context.getRequestId()).toEqual('Request #1');
  });

  it('Expect it creates context with serialized channel', () => {
    const context = new PgNotifyContext(33761, JSON.stringify({event: 'greeting'}));

    expect(context.getProcessId()).toEqual(33761);
    expect(context.getChannel()).toEqual({event: 'greeting'});
    expect(context.getData()).toBeUndefined();
    expect(context.getRequestId()).toBeUndefined();
  });
});