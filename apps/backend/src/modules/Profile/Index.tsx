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

  let profileImageTag;
  if (profileImage && profileImage.status === 3 && profileImage?.meta?.availableSizes) {
    const originalUrl = profileImage?.meta?.availableSizes?.original?.url ?? "";

    const srcset = Object.keys(profileImage?.meta?.availableSizes).reduce((acc: any, key: any) => {
      const size = profileImage?.meta?.availableSizes[key];
      if (!size.isJpg) 
        return acc;

      acc.push(`${size.url} ${size.width}w`)

      return acc;

    }, [] as string[])

    profileImageTag = <img src={originalUrl} srcSet={srcset.join(",")} alt={`${firstName} ${lastName}`} />;

  }

  // TODO: bring the image.status Enum to @core 
  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage isLoading={loading} isError={!!error}>
        {firstName && (
          <Grid
            templateColumns={{ base: "100%", t: "max(20%, 250px) 1fr" }}
            templateRows={{ base: "200px 1fr", t: "100%" }}
            gap="8"
          >
            <Box>
              {profileImageTag}
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
