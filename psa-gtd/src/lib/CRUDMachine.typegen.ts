
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.(machine).creatingService:invocation[0]": { type: "done.invoke.(machine).creatingService:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.(machine).deletingService:invocation[0]": { type: "done.invoke.(machine).deletingService:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.(machine).firstReading:invocation[0]": { type: "done.invoke.(machine).firstReading:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.(machine).reading:invocation[0]": { type: "done.invoke.(machine).reading:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.(machine).updatingService:invocation[0]": { type: "done.invoke.(machine).updatingService:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.(machine).creatingService:invocation[0]": { type: "error.platform.(machine).creatingService:invocation[0]"; data: unknown };
"error.platform.(machine).deletingService:invocation[0]": { type: "error.platform.(machine).deletingService:invocation[0]"; data: unknown };
"error.platform.(machine).firstReading:invocation[0]": { type: "error.platform.(machine).firstReading:invocation[0]"; data: unknown };
"error.platform.(machine).reading:invocation[0]": { type: "error.platform.(machine).reading:invocation[0]"; data: unknown };
"error.platform.(machine).updatingService:invocation[0]": { type: "error.platform.(machine).updatingService:invocation[0]"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "createDoc": "done.invoke.(machine).creatingService:invocation[0]";
"deleteDoc": "done.invoke.(machine).deletingService:invocation[0]";
"readDocs": "done.invoke.(machine).firstReading:invocation[0]" | "done.invoke.(machine).reading:invocation[0]";
"updateDoc": "done.invoke.(machine).updatingService:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "createDocsMap": "done.invoke.(machine).firstReading:invocation[0]" | "done.invoke.(machine).reading:invocation[0]";
"logError": "error.platform.(machine).creatingService:invocation[0]" | "error.platform.(machine).deletingService:invocation[0]" | "error.platform.(machine).firstReading:invocation[0]" | "error.platform.(machine).reading:invocation[0]" | "error.platform.(machine).updatingService:invocation[0]";
"saveReadDocs": "done.invoke.(machine).firstReading:invocation[0]" | "done.invoke.(machine).reading:invocation[0]";
"sendCreate": "done.invoke.(machine).creatingService:invocation[0]";
"sendDelete": "done.invoke.(machine).deletingService:invocation[0]";
"sendFirstRead": "done.invoke.(machine).firstReading:invocation[0]";
"sendRead": "done.invoke.(machine).reading:invocation[0]";
"sendUpdate": "done.invoke.(machine).updatingService:invocation[0]";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "createDoc": "CREATE";
"deleteDoc": "DELETE";
"readDocs": "done.invoke.(machine).creatingService:invocation[0]" | "done.invoke.(machine).deletingService:invocation[0]" | "done.invoke.(machine).updatingService:invocation[0]" | "xstate.init";
"updateDoc": "UPDATE";
        };
        matchesStates: "creatingService" | "deletingService" | "failure" | "firstReading" | "idle" | "reading" | "updatingService";
        tags: never;
      }
  