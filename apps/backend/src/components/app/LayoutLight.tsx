import React from "react";

import FooterLight from "./FooterLight";
import { Box, Container, Flex, Heading } from "@chakra-ui/react";

import { useAuthTabWideLogInOutReload } from "~/hooks";
import type { AppProps } from "~/types";
import { LanguageButtons } from "../ui";

const LayoutLight = ({ children }: AppProps) => {
  const [loginStatus] = useAuthTabWideLogInOutReload();
  return (
    <Flex justify="center" alignItems="center" direction="column" className={loginStatus} minH="100%" w="100%">
      <Container maxW={{base:"100%", t:"30em",d:"40em" }} centerContent mx="0">
        <Heading as="h1" fontSize={{base:"4xl", t:"5xl",d:"6xl" }} my="8">CultureMap</Heading>

        {children}
        <Box my="4"><FooterLight/></Box>
      </Container>
      <LanguageButtons />
    </Flex>
    
  );
};

export default LayoutLight;
