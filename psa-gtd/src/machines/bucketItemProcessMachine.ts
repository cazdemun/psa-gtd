import { createMachine } from 'xstate';

interface ProcessContext {
  hasAction: boolean;
  isQuarterly: boolean;
  isTwoMinutes: boolean;
}

interface ProcessEvent {
  type: 'HAS_ACTION' | 'NO_ACTION' | 'TRASH' | 'IDK_HAS_ACTION' | 'QUARTERLY' | 'NOT_QUARTERLY'
  | 'TWO_MINUTES' | 'MORE_THAN_TWO_MINUTES' | 'RESET' | 'REFERENCE' | 'SUPPORT';
}

const creatBucketItemProcessMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AxnWBZAhpgBYCWAdmAMQBKAogMq0AqA2gAwC6iK6sJALiXRluIAB6IA7AA4AdADYAzPIBMATjYBGTYumTN8gCwAaEAE9EAWk0qArLJWbDtttJc752zQF9vptFg4BMTkYLIQYPxgqAC2oQCCmILClAAS8fQA+vEAwkwAkgDyAHLsXEggyLwCQiIVEgiOclpG+pq20mq28t2mFgiabCqybKNj42M+fpUY2LB4hKQU4ZHRcRSJyWSU+QAiANKZ6Vm5BSVlolV8W6INKlqy3YaaenaqPZp9Vjb2PepO6mkhlU3V8-lmQUWoRWUViCSStUoxUK2TyRVKnEu1Ru9UQKnxskkils+MkhlGTiJKi+AzUmketkM0mZaiJ8jZ8jBM0C82CSzCEVh6zAm0RTGoGVSFwqVxqwluePJsmkjnanjUikUKhVNJUZOVmjUjl07JeklsXICcwWIWWEFQ+AAZvxRcJYJQAIoAVXi1CYtGoABkAJrSnjXWoKhCeem2OmaMmDDWSLo0tSPQ2uQ22JxqQxqTyWiG8qF2h3O11kd3IpiZb2+-1B0OYmXYyO4hBx4aSFSKNTJ3OqtP2DqasfjzWGIs8m382TEMCYADWHoArvhULCADZmShMADqKNw+WKXv99DDlTb8o7gy1siZrL1ih0ki0khpigfbHkPX7TPkaQ7zUadrT5aEF2XNcN23XdcEKOhMiYdJiiQw9MmPU9z0vWUcVABo1BVR42FsF9MxcI1qXMKwOkJF5bG6IYzReFRQMhW0wlQMBHWiMAyGwQpUHoVdkCqTcaFoAAxANaGKHJaBw686nwxBPC-H9JA5Nhk1TajaVjRlmU6NkOTYksONkLieK4-iwEE4TRPQcT6C9AAFVyENYFtwzlZTxFU+5ZDpI1+yTRQU1sXV9SAo0dGkU09AtLkyHQCJ4BlYtZ1CLEIxvFSEEseQaUsRxDAfF9dHxNg2RJRQzKyu1VjhDYETyq9cr8hpDCo-pBlY6YrXYud7SdF1WqrHLfKjck5E6H87GHR5pAnFa6oGzLwOWSCV3XTdoh3Sa8P8hAUzKoZnhCoYe01NMMw0GKc3zfNC3WmdNrCQgtnwAAjLcwCYH6-sO9t8psXtCSMONYpTZRipseQgoqlV7hqux6veyzuN42z7JEsT+GBtqGl0dMVTYF8Fr0w0DKZFkTOUTlXrA0swlgdAYkgfAzAIMxvrAQnOqkI1lXZPN1Cu3tFDTMrx0MPtyfNYEkvBN6WfCdB8gJ1sOqjGwmUJMd80cGGir0r9yV-KGAKA8mQKZoboX4B1YCIAXpscBQugpyK9L1MqYuNeL9ES9G1as7HsAB37+e1qaOwioLPHkS69UlmlqYZWnjOUUz7fMudYDxpz+CjoHY6OhppCGWRc0NcXU5u33orruKEvNXxfCAA */
  createMachine({
    id: 'processMachine',
    initial: 'determineAction',

    schema: {
      context: {} as ProcessContext,
      events: {} as ProcessEvent,
    },

    predictableActionArguments: true,

    tsTypes: {} as import("./bucketItemProcessMachine.typegen").Typegen0,

    context: {
      hasAction: false,
      isQuarterly: false,
      isTwoMinutes: false,
    },

    states: {
      determineAction: {
        on: {
          HAS_ACTION: 'draftActions',
          IDK_HAS_ACTION: "actionableTable",
          NO_ACTION: "referenceOrSupport",
          TRASH: "trash"
        },
      },

      draftActions: {
        on: {
          QUARTERLY: 'checkQuarterly',
          NOT_QUARTERLY: 'somedayMaybe',
        },
      },

      checkQuarterly: {
        on: {
          TWO_MINUTES: 'doIt',
          MORE_THAN_TWO_MINUTES: 'actionableTable',
        },
      },

      actionableTable: {},

      referenceOrSupport: {
        on: {
          REFERENCE: "referenceTable",
          SUPPORT: "supportTable"
        }
      },

      somedayMaybe: {},
      doIt: {},
      trash: {},
      referenceTable: {},
      supportTable: {}
    },

    on: {
      'RESET': ".determineAction"
    }
  });

export default creatBucketItemProcessMachine;
