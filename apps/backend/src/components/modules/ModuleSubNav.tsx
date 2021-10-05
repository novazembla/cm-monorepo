import React, { MouseEventHandler } from "react";
import { Box, Flex, Heading, Link, HStack, Button } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { ChevronRightIcon } from "@chakra-ui/icons";
import type { ModuleAccessRules } from "~/types";
import { useAuthentication } from "~/hooks";
interface BreadcrumbElement {
  title: string | React.ReactNode;
  path?: string;
}

export interface ButtonListElementLink extends ModuleAccessRules {
  label: string;
  to?: string;
  as?: React.ReactNode;
  isDisabled?: boolean;
  type: "back" | "navigation";
}

export interface ButtonListElementSubmit extends ModuleAccessRules {
  label: string;
  isLoading: boolean;
  isDisabled?: boolean;
  type: "submit";
  
}

export interface ButtonListElementButton extends ModuleAccessRules {
  label: string;
  isLoading: boolean;
  isDisabled?: boolean;
  onClick: MouseEventHandler;
  type: "button";
}

export interface ButtonListRenderElement extends ModuleAccessRules {
  key?: string;
  to?: string | undefined;
  as?: any;
  onClick?: MouseEventHandler | undefined;
  isLoading?: boolean | undefined;
  isDisabled?: boolean | undefined;
  colorScheme?: string | undefined;
  type?: "submit";
}

export type ButtonListElement =
  | ButtonListElementLink
  | ButtonListElementSubmit
  | ButtonListElementButton;

export const ModuleSubNav = ({
  breadcrumb,
  buttonList,
  children,
}: {
  breadcrumb: BreadcrumbElement[];
  buttonList?: ButtonListElement[];
  children?: React.ReactNode;
}) => {
  // TODO: improve look on mobile
  const [appUser] = useAuthentication();

  let permissisionedButtonList: React.ReactNode[] = [];

  if (Array.isArray(buttonList) && buttonList.length) {
    permissisionedButtonList = buttonList.reduce(function (
      pButtonList,
      button,
      index
    ) {
      if (button.userIs && !appUser?.has(button.userIs)) return pButtonList;

      if (button.userCan && !appUser?.can(button.userCan)) return pButtonList;

      let buttonProps: ButtonListRenderElement = {
        key: `bl-${index}`,
      };

      switch (button.type) {
        case "navigation":
          buttonProps = {
            ...buttonProps,
            to: button.to,
            as: NavLink,
            isDisabled: button.isDisabled,
          };
          break;

        case "back":
          buttonProps = {
            ...buttonProps,
            to: button.to,
            as: NavLink,
            colorScheme: "gray",
            isDisabled: button.isDisabled,
          };
          break;

        case "submit":
          buttonProps = {
            ...buttonProps,
            type: "submit",
            isLoading: button.isLoading,
            isDisabled: button.isDisabled,
          };
          break;

        case "button":
          buttonProps = {
            ...buttonProps,
            onClick: button.onClick,
            isLoading: button.isLoading,
            isDisabled: button.isDisabled,
          };
          break;
      }

      const b = <Button {...buttonProps}>{button?.label}</Button>;
      pButtonList.push(b);
      return pButtonList;
    },
    [] as React.ReactNode[]);
  }

  return (
    <>
      <Box
        layerStyle="pageContainerWhite"
        mb={{ base: 3, tw: 4 }}
        position="sticky"
        top={{ base: "48px", tw: "70px" }}
        zIndex="1002"
      >
        <Flex
          justifyContent="space-between"
          alignItems={{ base: "flex-start", mw: "center" }}
          direction={{ base: "column", mw: "row" }}
        >
          <Heading as="h2" fontSize={{ base: "md", t: "2xl" }}>
            {breadcrumb.map((element, index) => {
              if (index < breadcrumb.length - 1) {
                return (
                  <span key={`${index}-s`}>
                    {element?.path ? (
                      <Link
                        as={NavLink}
                        to={element?.path}
                        color="var(--chakra-colors-gray-600) !important"
                        _hover={{ color: "#000 !important" }}
                      >
                        {element?.title}
                      </Link>
                    ) : (
                      <>{element?.title}</>
                    )}

                    <ChevronRightIcon fontSize="1.2em" mt="-0.1em" />
                  </span>
                );
              }
              return <span key={`${index}-sep`}>{element?.title}</span>;
            })}
          </Heading>
          <Box>
            {(permissisionedButtonList && permissisionedButtonList.length > 0) && (
              <HStack spacing="2">{permissisionedButtonList}</HStack>
            )}

            {children}
          </Box>
        </Flex>
      </Box>
    </>
  );
};
export default ModuleSubNav;

/*
Examples
const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
    },
    {
      type: "navigation",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
    },
    {
      type: "button",
      isLoading: isSubmitting,
      onClick: () => _____ ,
      label: "button test",
    },
  ];
*/
