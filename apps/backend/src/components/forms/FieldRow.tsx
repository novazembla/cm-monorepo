import React from "react";
import { Flex, Text } from "@chakra-ui/react";

export const FieldRow = ({
  children,
  isDangerZone
}: {
  children: React.ReactNode;  
  isDangerZone?: string;
}): JSX.Element | null => {
  
  if (isDangerZone) 
    return <Flex direction="column" mt="4" _first={{mt:0}} border="2px solid" borderColor="red" borderRadius="lg" padding="2">
      <Text color="red" fontWeight="bold">{isDangerZone}</Text>
      {children}
    </Flex>

  return <Flex mt="4" _first={{mt:0}}>{children}</Flex>;
};

export default FieldRow;
