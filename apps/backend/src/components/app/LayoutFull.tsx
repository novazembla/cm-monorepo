import React from "react";

import { useTypedSelector } from "../../hooks";

import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

import { AppProps } from "../../types";

const LayoutFull = ({ children }: AppProps) => {
  const { authenticated } = useTypedSelector(({ auth }) => auth);
  
  return <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${authenticated? "logged-in":"logged-out"}`} >
    <Sidebar />
    <div className="flex flex-col flex-1 w-full relative t-0">
      <Header />
      <div className="h-full overflow-y-auto">
        {children}
        <Footer />
      </div>
    </div>
  </div>;
};

export default LayoutFull;
