import React from "react";
import GlobalServices from "../../machines/GlobalServicesMachine";
import { InterpreterFrom } from "xstate";

const GlobalServicesContext = React.createContext<{ service: InterpreterFrom<typeof GlobalServices>}>({} as any)

export default GlobalServicesContext;
