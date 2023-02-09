import {
  createMachine, assign, ActorRefFrom, spawn
} from 'xstate';
import createCRUDMachine from '../lib/CRUDMachine';
import { BucketItem, DoCategory, ProcessedItem } from '../models';

type Test = {
  _id: string
  title: string
}

const TestCRUDMachine = createCRUDMachine<Test>('test', 'local');
export type TestCRUDStateMachine = typeof TestCRUDMachine;
const BucketCRUDMachine = createCRUDMachine<BucketItem>('bucket', 'local');
export type BucketCRUDStateMachine = typeof BucketCRUDMachine;
const ProcessedCRUDMachine = createCRUDMachine<ProcessedItem>('processed', 'local');
export type ProcessedCRUDStateMachine = typeof ProcessedCRUDMachine;
const DoCategoryCRUDMachine = createCRUDMachine<DoCategory>('docategory', 'local');
export type DoCategoryCRUDStateMachine = typeof DoCategoryCRUDMachine;

export type GlobalServicesContext = {
  testCRUDActor: ActorRefFrom<TestCRUDStateMachine>
  bucketCRUDActor: ActorRefFrom<BucketCRUDStateMachine>
  processedCRUDActor: ActorRefFrom<ProcessedCRUDStateMachine>
  doCategoryCRUDMachine: ActorRefFrom<DoCategoryCRUDStateMachine>
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
    doCategoryCRUDMachine: {} as any,
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
      doCategoryCRUDMachine: () => spawn(DoCategoryCRUDMachine, DoCategoryCRUDMachine.id),
    })
  },
  services: {},
  guards: {},
})

export default GlobalServicesMachine;
export const hola = 'asd';