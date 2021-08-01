// import { useFetch } from "~/hooks/useFetch";
// const users = useFretch('xxx');
import { userProfileReadQueryGQL } from "@culturemap/core";

import { useQuery } from "@apollo/client";
import {
  Button,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { ModuleSubNav, ModulePage } from "~/components/modules";

import { moduleRootPath } from "./config";
import { useAuthentication, useConfig } from "~/hooks";

const Index = () => {
  const config = useConfig(); 
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  
  const { data, loading, error } = useQuery(userProfileReadQueryGQL, {
    variables: {
      userId: appUser?.id ?? 0,
      scope: config.scope,
    },
  });

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.profile.title", "Profile"),
    },
  ];

  const {firstName, lastName, email, emailVerified} = data?.userProfileRead ?? {};

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb}>
        <HStack spacing="2">
          <Button as={NavLink} to="/profile/update">
            {t("module.profile.button.update", "Update profile")}
          </Button>
          <Button as={NavLink} to="/profile/password">
            {t("module.profile.button.updatepassword", "Update password")}
          </Button>
        </HStack>
      </ModuleSubNav>
      <ModulePage isLoading={loading} isError={!!error}>
         {firstName &&
          <>
            <Stat mb="4">
              <StatLabel >
                {t("module.profile.data.title.fullname", "Name")}
              </StatLabel>
              <StatNumber textTransform="capitalize" mt="-1">
                {firstName} {lastName}
              </StatNumber>
            </Stat>

            <Stat mb="4">
              <StatLabel>
                {t("module.profile.data.title.email", "Email address")}
              </StatLabel>
              <StatNumber mt="-1">{email}</StatNumber>
            </Stat>

            <Stat mb="4">
              <StatLabel>
                {t(
                  "module.profile.data.title.emailverificationstatus",
                  "Email verification status"
                )}
              </StatLabel>
              <StatNumber mt="-1">
                {emailVerified
                  ? t(
                      "module.profile.data.title.emailverificationstatus.verified",
                      "You've verified your email address"
                    )
                  : t(
                      "module.profile.data.title.emailverificationstatus.notverified",
                      "You've not verified your email address. Check your inbox!"
                    )}
              </StatNumber>
            </Stat>
          </>
        }
      </ModulePage>
    </>
  );
};
export default Index;
