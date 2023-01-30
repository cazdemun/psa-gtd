import { BucketItem } from './../models/index';
import { createMachine, ActorRefFrom, assign, spawn } from 'xstate';
import creatBucketItemProcessMachine from './bucketItemProcessMachine';

interface ProcessContext {
  processes: ActorRefFrom<typeof creatBucketItemProcessMachine>[]
}

type ProcessEvent =
  | {
    type: 'SPAWN_MACHINES'; docs: BucketItem[];
  }

const bucketItemsProcessesService =
  /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AxnWBZAhpgBYCWAdmAHQRgAuYqAtuWAIKa0npkDEAEqwDKAfVYBhACoBJAPIA5ANoAGALqIU6WCU7d1IAB6IATAEYAHJSUmAbABYA7CZMBWMwE5n1zwBoQAT0QTJSNLJTDwiLCTAF9o3zQsHAJiFmo6BmYKdh1eKQARAGlhARFxaXllNSQQZE1tLjI9QwQjK0pPW3N7I08jLxNfAIQAWhMeyi8jNxNbKbNbax7rWPiMbFg8QlIKNPomFmyGnjkZUUlZRVU9Wq0cpuMjEPsAZmdH+1soh2ejQcDp9rOWxmEFuF7WcHLOI1NZJLapGh7TJsDhHCQAJSEfEq1zqd2qzSMn0oZlMLmsJjczx+pL+LQ+JMppmeZghXWcKxhiQ2yW2VAgqHwADNaIduLAeABFACqrHREgAouiADIATRx1Ru9V0BMQFJM7WmJg+QSp9g8dLc7UpSjMlOcMzctjcFM5CXWmxSOwFwtFqPFxxkEmEMrlipV6qumrxDXuCGcbieRmebjNjrJluc7TM1NzeeptjdsJ58J2xDAmAA1pKAK74VB7AA2fh4EgA6qdcFI5NLFYINRpbrHdQggj9KMCwUYXiZnvYrPY6c8J0prF5U8DrHalCmi9zPXzKOWq7X602W7gZOiFcIJAI5LeO8Iuz2+wOajGdaBmm5Se0lM4zxOG4AFKImvz+IgwyuJQjhmM4njBF05hGHuHq8iwPDXoICoSO+Wr4t+iD2BY1jPIsIFOCyjh2HSozjKYtjOLazGzvqMScmQ6A0PAmrFgeLC4kOX4GFB1h0YxE5ASyjxKOCbzPGhcJevy6T7Fk-qNNGwlaURCCzHSQSodC7rKYePoimKZC8YO2q6aJ+m2iSIGLM4mbZvmnmKSZ-EYWWRAVtWdYNgwzZCXZcZ2iEwSzF08HGi6lrWkazpOGYHwpvYSkliplCEDk+AAEaNmAEhFSV4WEQ5YzJrBdgJomCXkXRYzWJQVKzqSrTyT02UCTsqBgEKDBgGQ2CCDWyC1A2lXDnpc4GqSO5zlSPTOs1kGjiBlDPEok7pRC9jmq4fV+VQsDoIwkD4H4BB+IVYCzSJzTmiErLmrMIHTsmzyWrYO25rYKY7vYQJeKdpb8ugUi0E99nNGMwKwXm0w-CxAybSE5IQgBlJGQWHI+fuZ2ULQgqwEQcNxp8y7WB4uYJlujgbUM07Lp4jUsmy6WE7EQA */
  createMachine({
    id: 'processMachine',
    initial: 'idle',

    schema: {
      context: {} as ProcessContext,
      events: {} as ProcessEvent,
    },

    predictableActionArguments: true,

    tsTypes: {} as import("./bucketItemsProcessesServices.typegen").Typegen0,

    context: {
      processes: [],
    },

    states: {
      idle: {
        on: {
          'SPAWN_MACHINES': {
            actions: 'spawnMachines',
            internal: false,
            target: "idle",
          },
        },
      },
    },
  }, {
    actions: {
      spawnMachines: assign({
        // we can make so we return a previous created machine for a particular id
        processes: (ctx, event) => event.docs.map((doc) => {
          const existingMachine = ctx.processes.find((process) => process.id === doc._id);
          return existingMachine ?? spawn(creatBucketItemProcessMachine(), doc._id);
        }),
      })
    }
  });

export default bucketItemsProcessesService;
