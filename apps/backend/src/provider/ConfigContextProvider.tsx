import React, { Context, createContext, ReactNode } from "react";
import { config } from "~/config";


type Props = {
  children?: ReactNode;
};

// create context
export const ConfigContext: Context<any> = createContext({});

// context provider
export const ConfigContextProvider = ({ children }: Props) => {
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

ConfigContextProvider.defaultProps = {
  children: null,
};

const context = { ConfigContext, ConfigContextProvider };
export default context;
