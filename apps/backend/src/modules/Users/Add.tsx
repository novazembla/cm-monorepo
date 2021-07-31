import { Box, Button, HStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {ModuleSubNav} from "~/components/modules";


import { moduleRootPath } from './config';

const Add = () => {
  const {t} = useTranslation();

  const breadcrumb = [{
    path: moduleRootPath,
    title: t("module.users.title", "Users")
  },{
    title: t("module.users.page.title.adduser", "Add user")
  }];

  return (
    <>
      <ModuleSubNav
        breadcrumb={breadcrumb}
      >
        <HStack spacing="2">
        <Button colorScheme="gray" as={NavLink} to={moduleRootPath}>
            {t("module.button.cancel", "Cancel")}
          </Button>
          <Button
            onClick={() => {
              alert(1);
            }}
          >
            {t("module.user.button.add", "Add new user")}
          </Button>
        </HStack>
      </ModuleSubNav>
      <Box layerStyle="pageContainerWhite">
      <h1>{t("module.users.page.title.adduser", "Add user")}</h1>
      
    </Box>   
    </>
  )
}
export default Add