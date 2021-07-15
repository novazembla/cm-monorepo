import React from "react";

import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

import { useAuthTabWideLogout } from "../../hooks";

import { AppProps } from "../../types";

const LayoutFull = ({ children }: AppProps) => {
  const [loginStatus] = useAuthTabWideLogout();

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${loginStatus}`}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 w-full relative t-0">
        <Header />
        <div className="h-full overflow-y-auto">
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default LayoutFull;
