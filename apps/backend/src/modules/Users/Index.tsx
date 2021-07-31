import { Box, Button, HStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {ModuleSubNav} from "~/components/modules";

import { moduleRootPath } from "./config";

const Index = () => {
  const { t } = useTranslation();
  const breadcrumb = [{
    path: moduleRootPath,
    title: t("module.users.title", "Users")
  }];

  return (
    <>
      <ModuleSubNav
        breadcrumb={breadcrumb}
      >
        <HStack spacing="2">
          <Button as={NavLink} to="/users/create">{t('module.users.button.create',"Add user")}</Button>
          <Button as={NavLink} to="/users/update/123">{t('module.users.button.update',"Edit user")}</Button>
        </HStack>
      </ModuleSubNav>

      <Box layerStyle="pageContainerWhite">
        <h2>Page Dashboard</h2>
        <p>
          HERE SHOULD an alert be shown if the user has not cofirmed her
          email...
        </p>

        <p>INDEX</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
      </Box>
    </>
  );
};
export default Index;
