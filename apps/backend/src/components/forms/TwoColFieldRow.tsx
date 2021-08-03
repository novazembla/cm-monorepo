import React from "react";
import { SimpleGrid } from "@chakra-ui/react";

export const TwoColFieldRow = ({
  children
}: {
  children: React.ReactNode;  
}): JSX.Element | null => {
  return <SimpleGrid columns={{base:1,mw:2}} spacing="6" mt="4" sx={{
    "> div:nth-of-type(2n)": {
      mt:"0"
    }
  }}>{children}</SimpleGrid>;
};

export default TwoColFieldRow;
