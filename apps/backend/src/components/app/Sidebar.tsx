import React, { MouseEventHandler, useEffect, useState } from "react";
import {
  HiMenu,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlineMap,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { RiCalendarEventLine } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { NavLink } from "react-router-dom";
import {
  Box,
  Link,
  Icon,
  useDisclosure,
  useMediaQuery,
  IconButton,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { InlineLanguageButtons } from "../ui";

import {
  dashboadModuleAccessRules,
  taxonomiesModuleAccessRules,
  usersModuleAccessRules,
  pagesModuleAccessRules,
  settingsModuleAccessRules,
  locationsModuleAccessRules,
  eventsModuleAccessRules,
  toursModuleAccessRules,
} from "~/config/moduleaccessrules";

import { useAuthentication } from "~/hooks";

const NavItem = ({
  title,
  path,
  exact,
  icon,
  onClick,
}: {
  title: string;
  path: string;
  exact: boolean;
  icon: any;
  onClick: MouseEventHandler;
}) => {
  return (
    <Box>
      <Link
        as={NavLink}
        exact={exact}
        to={path}
        key={path}
        display="flex"
        alignItems="center"
        fontSize="lg"
        color="var(--chakra-colors-gray-800) !important"
        ml="-3px"
        pl="1"
        py="1"
        transition="all 0.3s"
        activeClassName="active"
        _hover={{
          textDecoration: "none",
          color: "var(--chakra-colors-wine-600) !important",
        }}
        sx={{
          "&.active": {
            color: "var(--chakra-colors-wine-600) !important",
          },
          "&.active .chakra-icon": {
            color: "var(--chakra-colors-wine-600) !important",
          },
        }}
        onClick={onClick}
      >
        <Icon as={icon} mr="2" />
        {title}
      </Link>
    </Box>
  );
};

export const Sidebar = () => {
  const [appUser] = useAuthentication();
  const { t } = useTranslation();

  const [tw] = useMediaQuery("(min-width: 55em)");

  const [isMobile, setIsMobile] = useState(false);

  const menuState = tw ? false : true;

  const { isOpen, onToggle, onClose } = useDisclosure();

  useEffect(() => {
    if (!tw) {
      if (!isMobile) {
        setIsMobile(true);
        if (isOpen) onClose();
      }
    } else {
      if (isMobile) {
        setIsMobile(false);
        if (isOpen) onClose();
      }
    }
  }, [isMobile, setIsMobile, tw, isOpen, onClose]);

  if (!appUser) return <></>;

  const mainNavLinks = [
    {
      title: t("mainnav.locations.title", "Locations"),
      path: "/locations",
      exact: false,
      icon: HiOutlineLocationMarker,
      ...locationsModuleAccessRules,
    },
    {
      title: t("mainnav.events.title", "Events"),
      path: "/events",
      exact: false,
      icon: RiCalendarEventLine,
      ...eventsModuleAccessRules,
    },
    {
      title: t("mainnav.tours.title", "Tours"),
      path: "/tours",
      exact: false,
      icon: HiOutlineMap,
      ...toursModuleAccessRules,
    },
    {
      title: t("mainnav.pages.title", "Pages"),
      path: "/pages",
      exact: false,
      icon: HiOutlineDocumentText,
      ...pagesModuleAccessRules,
    },
    {
      title: t("mainnav.taxonomies.title", "Taxonomies"),
      path: "/taxonomies",
      exact: false,
      icon: HiOutlineColorSwatch,
      ...taxonomiesModuleAccessRules,
    },
    {
      title: t("mainnav.users.title", "Users"),
      path: "/users",
      exact: false,
      icon: HiOutlineUsers,
      ...usersModuleAccessRules,
    },
    {
      title: t("mainnav.homepage.title", "Homepage"),
      path: "/homepage",
      exact: true,
      icon: HiOutlineHome,
      ...dashboadModuleAccessRules,
    },
    {
      title: t("mainnav.settings.title", "Settings"),
      path: "/settings",
      exact: false,
      icon: IoSettingsOutline,
      ...settingsModuleAccessRules,
    },
  ];

  return (
    <>
      {menuState && (
        <IconButton
          bg="white"
          color="black"
          size="sm"
          position="fixed"
          top="4px"
          left="4"
          w="40px"
          h="40px"
          zIndex="toast"
          onClick={onToggle}
          icon={isOpen ? <MdClose /> : <HiMenu />}
          fontSize="30px"
          aria-label={
            isOpen ? t("menu.close", "Close menu") : t("menu.open", "Open menu")
          }
          _hover={{
            bg: "white",
          }}
        />
      )}
      <Box
        w="100%"
        maxW={{ base: "100%", tw: "calc(260px + 1rem)" }}
        className={`${menuState ? "active" : "inactive"} ${
          !isOpen || !menuState ? "closed" : "open"
        }`}
        transition="all 0.2s"
        pr={{ base: 3, tw: 0 }}
        pl={{ base: 3, tw: 4 }}
        pb={{ base: 3, tw: 4 }}
        position="sticky"
        top={{ base: "3rem", tw: "4.5rem" }}
        sx={{
          "&.active": {
            position: "fixed",
            transform: "translateX(-100%)",
            zIndex: "popover",
            bg: "white",
            top: 0,
            height: "100%",
            overflow: "auto",
          },
          "&.active > div": {
            shadow: "none",
          },
          "&.active.open": {
            transform: "translateX(0%)",
          },
        }}
      >
        <Box
          layerStyle="pageContainerWhite"
          mt={{ base: 12, tw: 4 }}
          w={{ base: "100%", tw: "260px" }}
        >
          {mainNavLinks.map((link) => {
            if (link.userIs && !appUser?.has(link.userIs)) return null;

            if (link.userCan && !appUser?.can(link.userCan)) return null;

            return <NavItem key={link.path} {...link} onClick={onToggle} />;
          })}

          <Box mt="8">
            <InlineLanguageButtons />
          </Box>
        </Box>
      </Box>
    </>
  );
};
