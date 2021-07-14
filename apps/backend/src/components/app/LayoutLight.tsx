import React from "react";
import { useTypedSelector } from "../../hooks";

import FooterLight from "./FooterLight";

import { AppProps } from "../../types";

const LayoutLight = ({ children }: AppProps) => {

  const { authenticated } = useTypedSelector(({ auth }) => auth);
  
  return (
    <div className={`flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900 ${authenticated? "logged-in":"logged-out"}`}>
      <div className="flex flex-col flex-1 w-full relative t-0">
        <div className="h-full overflow-y-auto">
          {children}
          <FooterLight />
        </div>
      </div>
    </div>
  );
};

export default LayoutLight;
