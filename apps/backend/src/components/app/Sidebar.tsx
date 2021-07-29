import React, { MouseEventHandler } from "react";
import {
  HiMenu,
  HiOutlineHome,
  HiOutlineUsers,
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
  IconButton
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { InlineLanguageButtons } from "../ui";

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
        color="gray.800"
        ml="-3px"
        pl="1"
        py="1"
        transition="all 0.3s"
        activeClassName="active"
        _hover={{
          textDecoration: "none",
          color: "wine.600",
        }}
        sx={{
          "&.active": {
            color: "wine.600",
          },
          "&.active .chakra-icon": {
            color: "wine.600",
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
  const { t } = useTranslation();
  
  const [tw] = useMediaQuery("(min-width: 55em)");

  const menuState = tw ? false : true;

  const { isOpen, onToggle } = useDisclosure();

  const mainNavLinks = [
    {
      title: t("module.title.dashboard", "Dashboard"),
      path: "/dashboard",
      exact: true,
      icon: HiOutlineHome,
    },
    {
      title: t("module.title.locations", "Locations"),
      path: "/locations",
      exact: false,
      icon: HiOutlineLocationMarker,
    },
    {
      title: t("module.title.events", "Events"),
      path: "/events",
      exact: false,
      icon: RiCalendarEventLine,
    },
    {
      title: t("module.title.tours", "Tours"),
      path: "/tours",
      exact: false,
      icon: HiOutlineMap,
    },
    {
      title: t("module.title.users", "Users"),
      path: "/users",
      exact: false,
      icon: HiOutlineUsers,
    },
    {
      title: t("module.title.settings", "Settings"),
      path: "/settings",
      exact: false,
      icon: IoSettingsOutline,
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
        w="100vw"
        maxW={{ base: "100%", tw: "calc(260px + 1rem)" }}
        className={`${menuState ? "active" : "inactive"} ${
          !isOpen || !menuState ? "closed" : "open"
        }`}
        transition="all 0.2s"
        pr={{ base: 3, tw: 0 }}
        pl={{ base: 3, tw: 4 }}
        pb={{ base: 3, tw: 4 }}
        position="sticky"
        top={{ base: "48px", tw: "72px"}}
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
          mt={{ base: 12, tw: 4}}
          w={{ base: "100%", tw: "260px" }}
        >
          {mainNavLinks.map((link) => (
            <NavItem key={link.path} {...link} onClick={onToggle} />
          ))}

          <Box mt="8">
            <InlineLanguageButtons />
          </Box>
        </Box>
      </Box>
    </>
  );
};
