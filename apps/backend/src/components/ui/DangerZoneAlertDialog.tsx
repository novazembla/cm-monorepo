import React, { useState, ChangeEventHandler, ChangeEvent, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  VisuallyHidden,
  Text,
  Icon,
  useBreakpointValue,
  Flex,
  Box
} from "@chakra-ui/react";

import { AiOutlineAlert } from "react-icons/ai";
import { useTranslation } from "react-i18next";

export const DangerZoneAlertDialog = ({
  title,
  message,
  requireTextualConfirmation,
  isOpen,
  onNo,
  onYes,
}: {
  title: string;
  message: string;
  isOpen: boolean;
  requireTextualConfirmation?: boolean;
  onNo: () => void;
  onYes: () => void;
}) => {
  const [isConfirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cancelRef: any = React.useRef();
  const { t } = useTranslation();
  const token = t("dangerzonealertdialog.writedeletetoken", "DELETE");
  const size = useBreakpointValue({base:"md", t:"lg"})

  const onFilterChange: ChangeEventHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.value.toUpperCase().trim() === token.toUpperCase()) {
      setConfirmed(true);
    } else {
      setConfirmed(false);
    }
  };

  useEffect(() => {
    setIsLoading(!isOpen)
      
  }, [isOpen])


  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onNo} size={size}>
      <AlertDialogOverlay>
        <AlertDialogContent borderRadius="xl">
          <AlertDialogHeader fontSize="3xl" fontWeight="bold" verticalAlign="bottom">
            <Flex alignItems="flex-end">
              <Icon as={AiOutlineAlert} w="20" height="20" color="red.600" mr="2" transform="translateX(-0.2em);"/>
              <Box transform="translateY(0.2em);">
              {title}
              </Box>
              
            </Flex>
            
          </AlertDialogHeader>

          <AlertDialogBody>
            {message}

            {requireTextualConfirmation && (<>
            
              <Text mt="3" pb="1">
                {t(
                "dangerzonealertdialog.writedeletelabel",
                "Please enter \"{{token}}\" into the field below to unlock the action",
                { token }
              )}
              </Text>
              
              <FormControl>
                <FormLabel m="0">
                  <VisuallyHidden>
                    {t(
                      "dangerzonealertdialog.writedeletelabel",
                      "Written delete confirmation.",
                      { token }
                    )}
                  </VisuallyHidden>
                  <Input
                    autoComplete="please-confirm"
                    onChange={onFilterChange}
                    onBlur={onFilterChange}
                    textTransform="uppercase"
                    placeholder={t(
                      "dangerzonealertdialog.placeholder",
                      '{{token}}',
                      { token }
                    )}
                  />
                </FormLabel>
              </FormControl>
            </>
            )}
          </AlertDialogBody>

          <AlertDialogFooter mb="3">
            <Button ref={cancelRef} onClick={onNo}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => { 
                setIsLoading(true);
                onYes.call(null);
              }}
              ml={3}
              isLoading={isLoading}
              isDisabled={requireTextualConfirmation && !isConfirmed}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
