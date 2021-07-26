import React from "react";
import { Box } from "@chakra-ui/react";

export const AuthenticationFormContainer = ({
  children
}: {
  children?: React.ReactNode;  
}) => {
  return <Box layerStyle="pageContainer" padding="4" mt="4">{children}</Box>;
}