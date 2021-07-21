import React from "react";

import FooterLight from "./FooterLight";

import { useAuthTabWideLogInOutReload } from "../../hooks";
import type { AppProps } from "../../types";

const LayoutLight = ({ children }: AppProps) => {
  const [loginStatus] = useAuthTabWideLogInOutReload();
  return (
    <div
      className={`flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900 ${loginStatus}`}
    >
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
