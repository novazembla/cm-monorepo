import React, { useState, useEffect } from "react";

import { Button } from "@windmill/react-ui";
import { useHistory, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { LanguageButtons } from "~/components/ui";

import { useAuthConfirmEmailMutation } from "~/hooks/mutations";
import { useAuthentication } from "~/hooks";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const EmailConfirmation = () => {
  const [, { isLoggedIn }] = useAuthentication();
  const query = useQuery();
  const token = query.get("token");

  const [firstMutation, firstMutationResults] = useAuthConfirmEmailMutation();
  
  const [isTokenConfirmed, setIsTokenConfirmed] = useState(false);

  const { t } = useTranslation();

  const confirmingToken = firstMutationResults.loading;
  const confirmationError = firstMutationResults.error;


  const history = useHistory();
  useEffect(() => {
    const confirmToken = async () => {
      try {
        await firstMutation(token ?? '');
        setIsTokenConfirmed(true);
      } catch (err) {
        setIsTokenConfirmed(false);
      }
    }

    if (token) {
      confirmToken();

      
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!confirmingToken && confirmationError)
    return (
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white filter drop-shadow-md rounded-lg shadow-md dark:bg-gray-800">
        <div className="px-6 py-4">
          <h2 className="text-3xl font-bold text-center text-gray-700 dark:text-white">
            {t("page.emailconfirmation.error", "Oops!")}
          </h2>
          <p>{t("page.emailconfirmation.errorExplanation", "We could not veryfy your email address.")}</p>
          <p>TODO: add some logic to request a new verification email if user is logged in</p>
          <p>
            <Button type="button" onClick={() => history.push(isLoggedIn()? "/" : "/login")}>
              {(isLoggedIn())? t("page.emailconfirmation.button_goto_dashboard", "Goto dashboard") : t("page.emailconfirmation.button_goto_login", "Goto login")}
            </Button>
          </p>
        </div>
      </div>
    );

  if (!confirmingToken && isTokenConfirmed)
    return (
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white filter drop-shadow-md rounded-lg shadow-md dark:bg-gray-800">
        <div className="px-6 py-4">
          <h2 className="text-3xl font-bold text-center text-gray-700 dark:text-white">
            {t("page.emailconfirmation.thankyou", "Thank you!")}
          </h2>
          <p>{t("page.emailconfirmation.youCanNowLogin", "Your email has been confirmed.")}</p>
          <p>
            <Button type="button" onClick={() => history.push(isLoggedIn()? "/" : "/login")}>
              {(isLoggedIn())? t("page.emailconfirmation.button_goto_dashboard", "Goto dashboard") : t("page.emailconfirmation.button_goto_login", "Goto login")}
            </Button>
          </p>
        </div>
      </div>
    );

  // t("page.emailconfirmation.error", "The confrmation has failed. Please try again.")
  return (
    <>
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white filter drop-shadow-md rounded-lg shadow-md dark:bg-gray-800">
        <div className="px-6 py-4">
          TODO: nice loading screen ... 
        </div>
      </div>
      <LanguageButtons />
    </>
  );
};
export default EmailConfirmation;
