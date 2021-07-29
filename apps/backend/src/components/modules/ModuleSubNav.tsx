// import { useFetch } from "~/hooks/useFetch";
// const users = useFretch('xxx');

import { Box, Flex, Heading } from "@chakra-ui/react";

export const ModuleSubNav = ({
  breadcrumb, 
  children
}: {
  breadcrumb:React.ReactNode;
  children?:React.ReactNode;
}) => {
  return (
    <>
      <Box layerStyle="pageContainerWhite" mb={{ base: 3, tw: 4 }} position="sticky" top={{base:"48px", tw:"70px"}} zIndex="200">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h2" fontSize="2xl">
            {breadcrumb}
          </Heading>
          <Box>
            {children}
          </Box>
        </Flex>
      </Box>
    </>
  );
};
export default ModuleSubNav;



