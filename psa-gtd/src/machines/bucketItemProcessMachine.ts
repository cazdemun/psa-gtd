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
  /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AxnWBZAhpgBYCWAdmAMQBKAogMq0AqA2gAwC6iK6sJALiXRluIAB6IAtABZpADgB00gGwBGAJxsNygKyq5Adh0AaEAE8pspQGZV19TumbVO6wbbSAvp9NosOAmJyMAUIMH4wVABbYIBBTEFhSgAJWPoAfViAYSYASQB5ADl2LiQQZF4BIREyiQQAJn0FLWVpA1UXOQddZVMLBFU2eua2UbHx0dVvXwxsWDxCUgpQ8MiYinjEskpcgBEAaXTUjOy8opLRCr4t0Tr6tgMFOVVpfQN6nWV63VU+y2kbHY5PV7gZrLp6ippuVZgFFsEVhFonEEtVKIV8pkcgVipxLpUbrVECDhmCdCCDNJJm1rPU-gN1KoFDpHHI2eowcpOcpoX45gsgsswkj1mBqGAADZgABu+DI2EoAEUAKqxahMWjUAAyAE0LmUrlVhLcpKpIQpdGyPl02F82PZ6YN6rzYfNAksQsK1sFxVLZfKqBimOkVWqNdq9XiDQTqiaEJJaY9rQZdNYdA42CzHYzmaz2ZzOXIXf43fChah8AAzfibaqwShMADqmNwuUKyo19H1PGusaJCGUWma6fUymso0tBkdQ-Us7n8-nxf57oREAr1drwnruHydHSTFShX3zfSrfbne75Rjxv7jiZH1cHU0OjY6khjp0zVssnsBme9WeIsfBhEsBQ9BRUDAStIjAAN8lQegAFdkAqVB+BoWgADFNVoQosloS9DUJUA6jUaxmi5blXzcBxsyZFl5HzcFuSXOFBRCSDoMguCEOQ1D0PoZUAAUhN3Vgox7I0ahIxA7QURk31nQZ1BokxzGJSkng0RprDkLk3h0VjS3YxFvQoX0ZTlBUmGoNJkkI69pPEKR6gcJ5ZypORrCpaQ7w-L8XlcV8DBCox3m8YCyHQMJ4ANV0wOCfFexvGT4ycZQlDUZxRz0Qw1P6SQ7CZFSgR8wcsqMhKhVWZENlRFKr2Spy6mkOl1IGIZKpXcsqxreqyFiyTiOchBPPc20PnpNydC86w5vmhbrC6ssQkILZ8AAIylJhNqlJKpLjAw33kl5ZqMADGjagqrGkWxdJBB5wXJKFgL5NjwM4mCeKQlD0DQ-bhrqXT1Cee5bEm9qNHovMugLcEeVe+LupCWB0CiSB8DMAgzA2sAAb7VLCrTBR9ApWQ2naQZ8sQKHc0Y2HmPBICZlA5HQnQXJ+Hxhq6meR42TTVw5Bm4WuWnYqF0l2dlpM-gK1gIhuea01BhJ5R1fV18vLkVrfkhz97ReW6OX-YFXxlj6oK+7Adq2vHoyaw63NHVRlEUoZ3jmui6bZBmuXhi2EVgPi-v4W29odg7+zkIYSacbTNHqT3rHpJOAWeN8gX0vLA+qkUfUlSyAyVuME2JxkX3sCbqY64YJkZbQnF0iLPCAA */
  createMachine({
    id: 'processMachine',
    initial: "determineRelevance",

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
          NO_ACTION: "referenceOrSupport"
        },
      },

      draftActions: {
        on: {
          TWO_MINUTES: "doIt",
          MORE_THAN_TWO_MINUTES: "actionableTable"
        }
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
      supportTable: {},

      determineRelevance: {
        on: {
          QUARTERLY: "determineAction",
          NOT_QUARTERLY: "somedayMaybe",
          TRASH: "trash"
        }
      }
    },

    on: {
      'RESET': ".determineRelevance"
    }
  });

export default creatBucketItemProcessMachine;
