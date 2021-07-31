import React from "react";
import { useToken, Flex } from "@chakra-ui/react";

import BounceLoader from "react-spinners/BounceLoader";

export const LoadingIcon = ({ size = 90, type = "full" }: { size?: number, type: "full" | "light" | "inline" }) => {
  const [wine400] = useToken("colors", ["wine.400"]);
  const h = type === "full" ? {
    base: "calc(100vh - 106px)",
    tw: "calc(100vh -  142px)"
  } : "100%";

  let inlineProps = {}

  if (type === "inline")
    inlineProps = {
      position: "absolute",
      top: "50%",
      left: 0,
      transform: "translateY(-50%)",
    }
  return (<Flex w="100%" height={h} minH={h} justify="center" alignItems="center" {...inlineProps}>
      <BounceLoader color={wine400} {...size} />
  </Flex>)
  
  ;
};
