import React, { Context, createContext } from "react";
import { config, AppConfig } from "~/config";

// create context
export const ConfigContext: Context<AppConfig> = createContext<AppConfig>(config);

// context provider
export const ConfigContextProvider = ({ children }: {
  children: React.ReactNode
}) => {
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};