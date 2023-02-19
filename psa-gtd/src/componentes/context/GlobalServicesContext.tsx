import React from "react";
import GlobalServices from "../../machines/GlobalServicesMachine";
import { InterpreterFrom } from "xstate";

export type GlobalConfig = {
  actionableTableLimit: number
  disableAutoActionableTable: boolean
  lockedDoCategory?: string
}

/**
 * Potential variations of the setGlobalConfig
 * 
 * setGlobalConfig: (globalConfig: SetStateAction<Partial<GlobalConfig>>) => any
 * setGlobalConfig: (partialGlobalConfig: GlobalConfig | ((config: GlobalConfig) => GlobalConfig)) => any
 * 
 * Current function signature is due to the following implementation:
 * 
 * setGlobalConfig: (partialGlobalConfig) => setGlobalConfig((config) => ({ ...config, ...partialGlobalConfig }))
 */
const GlobalServicesContext = React.createContext<{
  service: InterpreterFrom<typeof GlobalServices>
  globalConfig: GlobalConfig
  setGlobalConfig: (partialGlobalConfig: Partial<GlobalConfig>) => any
}>({} as any)

export default GlobalServicesContext;
