import React from "react";
import { Flex } from "@chakra-ui/react";

export const FieldRow = ({
  children
}: {
  children: React.ReactNode;  
}): JSX.Element | null => {
  return <Flex mt="4" _first={{mt:0}}>{children}</Flex>;
};

export default FieldRow;
