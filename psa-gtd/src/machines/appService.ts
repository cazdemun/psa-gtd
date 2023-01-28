import { createMachine } from 'xstate';

interface AppContext {
  isConnected: boolean;
}

interface AppEvent {
  type: 'CONNECT' | 'DISCONNECT';
}

const appService = 
/** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDKYBOA3AlgMZgB0E+shA9gHY1iEAukAxAMIDyAclwKJsAVANoAGALqJQqKrHyN8tSSAAeiAEwBGESQ0AOAOwBWEQGZdGgCwA2AJz61+gDQgAnusO6SJ7yesiLujY2IrqGAL5hzmiYOATEJNR0DPI0UCwQtKT4NLhUANak0Vh4RKSJ9EzZUAjZuYTI8rSiYs1K0rKNNEqqCIbWJFZqxmoW+jaGhiZqas5uCGr+JCJqvhamVlrT4xFR6MVxZbQVKWk42FTYJKgANg0AZhcAtiRFsaUJR8lVNTlU9Z3NVpIEDtOQKLrAnqabR6IymczWOwOWbqLQkXQ+XxWfyBYK6HYgV4leLlZKsAAiAEkMJwePxhOI2jIwYpIYg+lYBkNlqNxpNpiiEOYSMYRGL9IMbCYbBZJhFIiAaFQIHAlESDkyOuDuogALRWQX6gnq97kSifJiQTUsiGgHoWGauRA2DRc0V2IwaDb6CzGvZvEkWk7Wzo6hAmKyGHQGQwabyxixrCwmQULNQkbli8YRn0mL1+mLEw5JS0QEPatkIfQiGwivNqXQiWNGfTmQXBJYY3xjQxWbzjNTysJAA */
createMachine({
  id: 'appService',
  initial: 'disconnected',
  context: {
    isConnected: false,
  },
  schema: {
    context: {} as AppContext,
    events: {} as AppEvent,
    services: {} as {
      connect: { data: string }
    },
  },
  states: {
    disconnected: {
      on: { CONNECT: 'connecting' },
    },
    connecting: {
      invoke: {
        src: 'connect',
        onDone: { target: 'connected', actions: 'setConnected' },
        onError: 'disconnected',
      },
    },
    connected: {
      on: { DISCONNECT: 'disconnected' },
    },
  }
}, {
  actions: {
    setConnected: (context) => {
      context.isConnected = true;
    },
  },
  services: {
    connect: (context, event) => {
      return new Promise((resolve, reject) => {
        fetch('/handshake')
          .then((response) => {
            if (response.status === 200) {
              resolve('connected');
            } else {
              reject();
            }
          })
          .catch((error) => {
            reject();
          });
      });
    },
  }
});

export default appService;
