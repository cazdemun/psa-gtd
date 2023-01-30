import {
  createMachine, assign, ActorRefFrom, spawn
} from 'xstate';
import createCRUDMachine from '../lib/CRUDMachine';
import { BucketItem, ProcessedItems } from '../models';

type Test = {
  _id: string
  title: string
}

const TestCRUDMachine = createCRUDMachine<Test>('test', 'local');
export type TestCRUDStateMachine = typeof TestCRUDMachine;
const BucketCRUDMachine = createCRUDMachine<BucketItem>('bucket', 'local');
export type BucketCRUDStateMachine = typeof BucketCRUDMachine;
const ProcessedCRUDMachine = createCRUDMachine<ProcessedItems>('processed', 'local');
export type ProcessedCRUDStateMachine = typeof ProcessedCRUDMachine;

export type GlobalServicesContext = {
  testCRUDActor: ActorRefFrom<typeof TestCRUDMachine>
  bucketCRUDActor: ActorRefFrom<typeof BucketCRUDMachine>
  processedCRUDActor: ActorRefFrom<typeof ProcessedCRUDMachine>
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
    bucketCRUDActor: {} as any,
    processedCRUDActor: {} as any,
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
      bucketCRUDActor: () => spawn(BucketCRUDMachine, BucketCRUDMachine.id),
      processedCRUDActor: () => spawn(ProcessedCRUDMachine, ProcessedCRUDMachine.id),
    })
  },
  services: {},
  guards: {},
})

export default GlobalServicesMachine;
export const hola = 'asd';