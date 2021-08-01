import { useState } from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { TextErrorMessage } from "~/components/forms";

import { PasswordResetValidationSchema } from "~/validation";
import { useUserProfilePasswordUpdateMutation } from "~/hooks/mutations";
import { useAuthentication } from "~/hooks";

import { Button, Divider, HStack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import { ModuleSubNav, ModulePage } from "~/components/modules";

import { moduleRootPath } from "./config";

import { PasswordUpdateForm } from "./forms";



const Update = () => {
  const [appUser, {logoutAndRedirect}] = useAuthentication();
  const { t } = useTranslation();
  
  const [firstMutation, firstMutationResults] = useUserProfilePasswordUpdateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.profile.title", "Profile"),
    },
    {
      title: t("module.profile.button.updatepassword", "Update password"),
    },
  ];

  const formMethods = useForm({
    mode: "onTouched",
    resolver: yupResolver(PasswordResetValidationSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof PasswordResetValidationSchema>
  ) => {
    setIsFormError(false);
    try {
      if (appUser) {
        await firstMutation(appUser?.id, newData.newPassword);
        await logoutAndRedirect("/password-has-been-reset");
      } else {
        setIsFormError(true);
      }
    } catch (err) {
      setIsFormError(true);
    }
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={disableForm}>
            <ModuleSubNav breadcrumb={breadcrumb}>
              <HStack spacing="2">
                <Button colorScheme="gray" as={NavLink} to={moduleRootPath}>
                  {t("module.button.cancel", "Cancel")}
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {t("module.button.update", "Update")}
                </Button>
              </HStack>
            </ModuleSubNav>
            <ModulePage>
              {(isFormError) && <><TextErrorMessage error="general.writeerror.desc" /><Divider/></>}
              <PasswordUpdateForm />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
