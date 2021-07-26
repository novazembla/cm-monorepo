import React from "react";

import FooterLight from "./FooterLight";
import { Box, Container, Flex, Heading } from "@chakra-ui/react";

import { useAuthTabWideLogInOutReload } from "~/hooks";
import type { AppProps } from "~/types";
import { LanguageButtons } from "../ui";

const LayoutLight = ({ children }: AppProps) => {
  const [loginStatus] = useAuthTabWideLogInOutReload();
  return (
    <Flex justify="center" alignItems="center" direction="column" className={loginStatus} minH="100%">
      <Container maxW={['90%','50%']} centerContent>
        <Heading as="h1">LOGO</Heading>

        {children}
        <Box mt="4"><FooterLight/></Box>
      </Container>
      <LanguageButtons />
    </Flex>
    
  );
};

export default LayoutLight;
