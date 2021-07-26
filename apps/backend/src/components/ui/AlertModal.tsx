import React, { useState } from "react";
import { useAuthentication } from "~/hooks";

export const AlertModal = ({ type }: { type: string }) => {
  const [apiUser] = useAuthentication();
  const [isLoading, setIsLoading] = useState(false);
  // <div type={type}>Lorem ipsum dolor sit {apiUser?.id}</div> xxxx
  return <div>Lorem ipsum dolor sit {apiUser?.id}</div>;
};
