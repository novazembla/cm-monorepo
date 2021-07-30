import { useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { gql, useQuery } from "@apollo/client";

import { AlertBox } from "~/components/ui";
import { useTypedDispatch, useAuthentication, useTypedSelector } from "~/hooks";
import { CMConfig } from "~/config";

import { userEmailVerificationState } from "~/redux/slices/user";
import {
  AlertDescription,
  AlertTitle,
  Box,
  Grid,
  Button,
} from "@chakra-ui/react";
import { useAuthRequestEmailVerificationEmail } from "~/hooks/mutations";

const GET_EMAIL_VERIFICATION_STATUS = gql`
  query userProfileRead($scope: String!, $userId: Int!) {
    userProfileRead(scope: $scope, userId: $userId) {
      emailVerified
    }
  }
`;

export const AlertEmailVerification = () => {
  const { emailVerified } = useTypedSelector(({ user }) => user);

  const [isRequestingError, setIsRequestingError] = useState(false);

  const [requestMutation, requestMutationResults] =
    useAuthRequestEmailVerificationEmail();

  const dispatch = useTypedDispatch();
  const wrappedDispatch = useCallback(
    (state) => {
      dispatch(userEmailVerificationState(state));
    },
    [dispatch]
  );

  const { t } = useTranslation();

  const [apiUser] = useAuthentication();

  const { data } = useQuery(GET_EMAIL_VERIFICATION_STATUS, {
    skip: emailVerified === "yes",
    variables: {
      scope: CMConfig.scope,
      userId: apiUser?.id ?? 0,
    },
  });

  let localEmailVerified =
    typeof data?.userProfileRead?.emailVerified === "boolean"
      ? data?.userProfileRead?.emailVerified
        ? "yes"
        : "no"
      : emailVerified;

  useEffect(() => {
    if (localEmailVerified !== emailVerified)
      wrappedDispatch(localEmailVerified);
  }, [wrappedDispatch, emailVerified, localEmailVerified]);

  const requestAnotherEmail = async () => {
    setIsRequestingError(false);

    try {
      if (apiUser?.id) {
        await requestMutation(apiUser.id);
      } else {
        setIsRequestingError(true);
      }
    } catch (err) {
      setIsRequestingError(true);
    }
  };

  let title = t(
    "alert.emailnotverfied.title",
    "You have not confirmed your email address, yet. "
  );
  let desc = t(
    "alert.emailnotverfied.info",
    "Please check your inbox and follow the link provided in the email. In case the email didn't come through you can request another email by clicking the button."
  );

  if (requestMutationResults.error) {
    title = t("general.error.title", "We are sorry");
    desc = t(
      "alert.emailnotverfied.requresterrorinfo",
      "Something went wrong. Please try again in a little bit."
    );
  }

  if (requestMutationResults.called && requestMutationResults.data) {
    title = t("general.success.title", "Thank you!");
    desc = t(
      "alert.emailnotverfied.requrestsuccessinfo",
      "We've sent you another email. Please check your inbox."
    );
  }

  return (
    <>
      {localEmailVerified === "no" && !requestMutationResults.loading && (
        <AlertBox status="warning" hasClose>
          <Grid
            w="100%"
            templateColumns={{ base: "1fr", tw: "66% 34%" }}
            gap="4"
            alignItems={{ base: "start", tw: "center" }}
          >
            <Box>
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription>{desc}</AlertDescription>
            </Box>
            <Box textAlign="center">
              {!requestMutationResults.error &&
                !isRequestingError &&
                !requestMutationResults.called && (
                  <Button
                    colorScheme="orange"
                    isLoading={!!requestMutationResults.loading}
                    variant="outline"
                    onClick={requestAnotherEmail}
                  >
                    {t(
                      "alert.emailnotverfied.button",
                      "Request verification email"
                    )}
                  </Button>
                )}
            </Box>
          </Grid>
        </AlertBox>
      )}
    </>
  );
};
