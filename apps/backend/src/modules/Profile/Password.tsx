import { useState } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { PasswordResetValidationSchema } from "~/validation";
import { useUserProfilePasswordUpdateMutation } from "./hooks";
import { useAuthentication } from "~/hooks";

import { Divider } from "@chakra-ui/react";

import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";

import { PasswordUpdateForm } from "./forms";

const Update = () => {
  const [appUser, { logoutAndRedirect }] = useAuthentication();
  const { t } = useTranslation();

  const [firstMutation, firstMutationResults] =
    useUserProfilePasswordUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(PasswordResetValidationSchema as any),
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof PasswordResetValidationSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        await firstMutation(appUser?.id, newData.newPassword);
        setIsNavigatingAway(true);
        await logoutAndRedirect("/password-has-been-reset");
      } else {
        setHasFormError(true);
      }
    } catch (err) {
      setHasFormError(true);
    }
  };

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.profile.title", "Profile"),
    },
    {
      title: t("module.profile.button.updatepassword", "Update password"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "profileUpdate",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "profileUpdate",
    },
  ];

  return (
    <>
      <FormNavigationBlock
        shouldBlock={!isNavigatingAway && isDirty && !isSubmitting}
      />
      <FormProvider {...formMethods}>
        <FormScrollInvalidIntoView />
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="new-password"
        >
          <fieldset disabled={disableForm}>
            <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
            <ModulePage>
              {hasFormError && (
                <>
                  <TextErrorMessage error="general.writeerror.desc" />
                  <Divider />
                </>
              )}
              <PasswordUpdateForm />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
