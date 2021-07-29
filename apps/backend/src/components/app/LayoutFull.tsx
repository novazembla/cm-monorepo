import React from "react";
import { Box, Grid, Divider } from "@chakra-ui/react";

import { Footer, Header, Sidebar } from ".";

import { useAuthTabWideLogInOutReload } from "~/hooks";

import { AppProps } from "~/types";

export const LayoutFull = ({ children }: AppProps) => {
  const [loginStatus] = useAuthTabWideLogInOutReload();

  return (
    <Grid className={loginStatus} w="100%" templateColumns={{base:"1fr", tw:"300px 1fr"}} gap="4" alignItems="start">
      <Header />
      
      <Sidebar />
      
      <Box pl={{ base: 3, tw: 4 }} pr={{ base: 3, tw: 4 }} pb={{base:3, tw:4}} mt={{base:"4.5em", tw:"6.5em"}}  w="100%">
        <Box  mb={{base:2, tw:3}}>
        {children}
        </Box>
        
        <Footer />
      </Box>
      
    </Grid>
  );
};
