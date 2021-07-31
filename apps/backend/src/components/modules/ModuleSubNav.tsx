// import { useFetch } from "~/hooks/useFetch";
// const users = useFretch('xxx');

import { Box, Flex, Heading, Link } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { ChevronRightIcon } from '@chakra-ui/icons'

interface BreadcrumbElement {
  title: string;
  path?: string;
}

export const ModuleSubNav = ({
  breadcrumb, 
  children
}: {
  breadcrumb:BreadcrumbElement[];
  children?:React.ReactNode;
}) => {
  // TODO: improve look on mobile 
  return (
    <>
      <Box layerStyle="pageContainerWhite" mb={{ base: 3, tw: 4 }} position="sticky" top={{base:"48px", tw:"70px"}} zIndex="200">
        <Flex justifyContent="space-between" alignItems={{base:"flex-start",mw:"center"}} direction={{base:"column",mw:"row"}}>
          <Heading as="h2" fontSize={{base:"md",t:"2xl"}} >
            {
              breadcrumb.map((element, index) => {
                if (index < breadcrumb.length -1) {
                  return <span key={`${index}-s`}>
                    {(element?.path)? <Link
                      as={NavLink}
                      to={element?.path}
                      color="gray.600"
                      _hover={{ color: "wine.600" }}
                    >
                      {element?.title}
                    </Link> : <>{element?.title}</>}
                  
                    <ChevronRightIcon fontSize="1.2em" mt="-0.1em"/></span>;
                }
                return <span key={`${index}-sep`}>{element?.title}</span>;
              })
            }
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



