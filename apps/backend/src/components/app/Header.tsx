import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { HiOutlineLogout } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";

import {
  Heading,
  Grid,
  Link,
  Avatar,
  Box,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useMediaQuery,
} from "@chakra-ui/react";

import { useAuthLogoutMutation } from "~/hooks/mutations";
import { useAuthentication } from "~/hooks";

const menuLinkStyling = {
  bg:"#fff",
  color:"wine.500",
};

export const Header = (/* props */) => {
  const history = useHistory();
  const [logoutMutation] = useAuthLogoutMutation();
  const [apiUser, {logoutAndRedirect}] = useAuthentication();
  const { t } = useTranslation();

  const onLogoutClick = async () => {
    if (apiUser) {
      try {
        await logoutMutation(apiUser.id);
      } catch (err) {}
      await logoutAndRedirect();
    }
  };

  const [tw] = useMediaQuery("(min-width: 55em)");

  const avatarSize = tw ? "md" : "sm";
  const showLogo = tw ? "block" : "none";

  return (
    <Box
      m="0"
      pr={{ base: 3, tw: 4 }}
      pl={{ base: 3, tw: 4 }}
      position="fixed"
      w="100%"
      h="auto"
      top="0"
      minH="40px"
      zIndex="overlay"
      bg="white"
      shadow="md"
    >
      <Grid
        bg="white"
        gap={6}
        templateColumns={{ base: "32px 1fr 32px", tw: "260px 1fr 48px" }}
        alignItems="center"
        p={{ base: 2, tw: 3 }}
      >
        <Box>
          <Heading as="h2" ml="2">
            <Link
              display={showLogo}
              as={NavLink}
              exact
              to="/dashboard"
              color="black"
              textDecoration="none !important"
            >
              CultureMap
            </Link>
          </Heading>
        </Box>
        <Box w="200px" h="32px" bg="gray.400">
          Search
        </Box>

        <Menu
          offset={[tw?-20:-20,tw?-20:-10]}
          placement="bottom-start"
        >
          <MenuButton>
            <Avatar
              bg="wine.500"
              color="white"
              size={avatarSize}
              name={`${apiUser?.firstName ?? "User"} ${apiUser?.lastName ?? "Profile"}`}
              _hover={{ bg: "wine.600" }}
            />
          </MenuButton>
          <MenuList
            shadow="lg"
            
            // mt={{ base: 1.5, tw: 2.5 }}
            // mr={{ base: -1, tw: -1 }}
            bg="white"
            borderRadius="lg"
            fontSize="lg"
          >
            <MenuItem
              iconSpacing="2"
              icon={<Icon as={CgProfile} fontSize="lg"/>}
              onClick={() => history.push("/profile")}

              _hover={menuLinkStyling}
              _focus={menuLinkStyling}
            >
              {t("avatar.menu.myprofile", "My profile")}
            </MenuItem>
            <MenuItem
              iconSpacing="2"
              icon={<Icon as={HiOutlineLogout} mt="-1" fontSize="lg"/>}
              onClick={onLogoutClick}
              _hover={menuLinkStyling}
              _focus={menuLinkStyling}
            >
              {t("avatar.menu.logout", "Logout")}
            </MenuItem>
          </MenuList>
        </Menu>
      </Grid>
    </Box>
  );
};
