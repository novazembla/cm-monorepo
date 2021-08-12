import { useContext } from "react";
import { ConfigContext } from "~/provider";

export const useConfig = () => {
  const config = useContext(ConfigContext);
  return config;
};
