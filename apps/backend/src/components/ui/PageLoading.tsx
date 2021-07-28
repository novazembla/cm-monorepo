import React from "react";
import { useToken } from "@chakra-ui/react";

import BounceLoader from "react-spinners/BounceLoader";

export const PageLoading = ({ size = 90 }: { size?: number }) => {
  const [wine400] = useToken("colors", ["wine.400"]);

  return <BounceLoader color={wine400} {...size} />;
};
