/* eslint-disable quotes */
/* eslint-disable max-len */
import {
  createMachine, assign, ActorRefFrom, spawn
} from 'xstate';
import createCRUDMachine from './CRUDMachine';

type Test = {
  _id: string
  title: string
}

const TestCRUDMachine = createCRUDMachine<Test>('test', 'local');

export type GlobalServicesContext = {
  testCRUDActor: ActorRefFrom<typeof TestCRUDMachine>
};

type GlobalServicesEvent =
  | { type: 'EMPTY'; }

const GlobalServicesMachine = createMachine({
  tsTypes: {} as import("./GlobalServicesMachine.typegen").Typegen0,
  schema: {
    context: {} as GlobalServicesContext,
    events: {} as GlobalServicesEvent,
  },
  context: {
    testCRUDActor: {} as any,
  },
  id: "globalServices",
  initial: "start",
  predictableActionArguments: true,
  preserveActionOrder: true,
  states: {
    start: {
      always: {
        actions: 'spawnCRUDActors',
        target: 'idle',
      }
    },
    idle: {}
  },
}, {
  actions: {
    spawnCRUDActors: assign({
      testCRUDActor: () => spawn(TestCRUDMachine, TestCRUDMachine.id),
    })
  },
  services: {},
  guards: {},
})

export default GlobalServicesMachine;
export const hola = 'asd';