import React from "react";
import GlobalServices from "../../machines/GlobalServicesMachine";
import { InterpreterFrom } from "xstate";

export type GlobalConfig = {
  actionableTableLimit: number
  disableAutoActionableTable: boolean
}

const GlobalServicesContext = React.createContext<{
  service: InterpreterFrom<typeof GlobalServices>
  globalConfig: GlobalConfig
  setGlobalConfig: (partialGlobalConfig: Partial<GlobalConfig>) => any
}>({} as any)

export default GlobalServicesContext;
