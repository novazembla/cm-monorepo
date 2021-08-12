import React from "react";
import { Box, Grid } from "@chakra-ui/react";

import { Footer, Header, Sidebar } from ".";

import { useAuthTabWideLogInOutReload } from "~/hooks";

import { AppProps } from "~/types";

export const LayoutFull = ({ children }: AppProps) => {
  const [loginStatus] = useAuthTabWideLogInOutReload();
  
  return (
    <Grid
      className={loginStatus}
      w="100%"
      // templateColumns={{ base: "1fr", tw: "260px 1fr" }}
      templateColumns={{ base: "100%", tw: "260px calc(100% - 260px - 1em)" }}
      gap="4"
      alignItems="start"
      pt={{ base: "48px", tw: "72px" }}
    >
      <Header />

      <Sidebar />

      <Box p={{ base: 3, tw: 4 }} w="100%">
        <Box mb={{ base: 2, tw: 3 }}>{children}</Box>

        <Footer />
      </Box>
    </Grid>
  );
};
export default LayoutFull;