import { userProfileReadQueryGQL } from "@culturemap/core";

import { useQuery } from "@apollo/client";
import { Stat, StatLabel, StatNumber, Box, Grid } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";
import { useAuthentication, useConfig } from "~/hooks";
import { ApiImage } from "~/components/ui";

const Index = () => {
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();

  const { data, loading, error } = useQuery(userProfileReadQueryGQL, {
    variables: {
      id: appUser?.id ?? 0,
      scope: config.scope,
    },
  });

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.profile.title", "Profile"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: "/profile/update",
      label: t("module.profile.button.update", "Update profile"),
      userCan: "profileUpdate",
    },
    {
      type: "navigation",
      to: "/profile/password",
      label: t("module.profile.button.updatepassword", "Update password"),
      userCan: "profileUpdate",
    },
  ];

  const { firstName, lastName, email, emailVerified, profileImage } =
    data?.userProfileRead ?? {};

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage isLoading={loading} isError={!!error}>
        {firstName && (
          <Grid
            templateColumns={{ base: "100%", t: "max(20%, 250px) 1fr" }}
            templateRows={{ base: "auto 1fr", t: "auto" }}
            gap={{ base: "6", s: "8" }}
          >
            <Box>
              <ApiImage
                id={profileImage?.id}
                status={profileImage?.status}
                meta={profileImage?.meta}
                forceAspectRatioPB={133.33}
                showPlaceholder
                alt={`${firstName} ${lastName}`}
                sizes="(min-width: 45em) 20v, 95vw"
                placeholder={t(
                  "module.profile.image.placeholder",
                  "No profile picture uploaded"
                )}
              />
            </Box>
            <Box>
              <Stat mb="4">
                <StatLabel fontSize="md">
                  {t("module.profile.data.title.fullname", "Name")}
                </StatLabel>
                <StatNumber textTransform="capitalize" mt="-1">
                  {firstName} {lastName}
                </StatNumber>
              </Stat>

              <Stat mb="4">
                <StatLabel fontSize="md">
                  {t("module.profile.data.title.email", "Email address")}
                </StatLabel>
                <StatNumber mt="-1">{email}</StatNumber>
              </Stat>

              <Stat mb="4">
                <StatLabel fontSize="md">
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
            </Box>
          </Grid>
        )}
      </ModulePage>
    </>
  );
};
export default Index;
