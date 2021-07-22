import React, { Context, createContext, ReactNode } from "react";
import merge from "deepmerge";
import CMSettings from "../culturemap";

export type CultureMapSettings = {
  apiUrl?: string | undefined;
  navigation?: {
    main: Array<object>;
    footer: Array<object>;
  };
  logos?: Array<object>;
};

// initial state
const settingsDefault: CultureMapSettings = {
  apiUrl: `${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`,
  navigation: {
    main: [],
    footer: [],
  },
  logos: [],
};

let settings: CultureMapSettings = {};

try {
  settings = merge(settingsDefault, CMSettings);
} catch (Err) {
  // eslint-disable-next-line no-console
  console.error(
    "Please make sure to hava a culturemap.js file in the root folder"
  );
}

type Props = {
  children?: ReactNode;
};

// create context
export const CulturemapContext: Context<any> = createContext({});

// context provider
export const CulturemapContextProvider = ({ children }: Props) => {
  return (
    <CulturemapContext.Provider value={settings}>
      {children}
    </CulturemapContext.Provider>
  );
};

export const getCulturemapSettings = (): CultureMapSettings => settings;

CulturemapContextProvider.defaultProps = {
  children: null,
};

export default { CulturemapContext, CulturemapContextProvider };
