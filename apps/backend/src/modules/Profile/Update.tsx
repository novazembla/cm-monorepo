import { useState, useEffect } from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { TextErrorMessage } from "~/components/forms";

import { UserProfileUpdateValidationSchema } from "~/validation";
import { useUserProfileUpdateMutation } from "~/hooks/mutations";
import { useAuthentication, useConfig, useTypedDispatch } from "~/hooks";
import { userProfileUpdate } from "~/redux/slices/user";

import { Divider, useToast } from "@chakra-ui/react";
import { userProfileReadQueryGQL } from "@culturemap/core";
import { useQuery } from "@apollo/client";

import { ModuleSubNav, ModulePage, ButtonListElement } from "~/components/modules";

import { moduleRootPath } from "./config";

import { UpdateForm } from "./forms";

const Update = () => {
  const config = useConfig();
  const dispatch = useTypedDispatch();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const toast = useToast();

  const { data, loading, error } = useQuery(userProfileReadQueryGQL, {
    variables: {
      userId: appUser?.id ?? 0,
      scope: config.scope,
    },
  });

  const history = useHistory();
  const [firstMutation, firstMutationResults] = useUserProfileUpdateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const disableForm = firstMutationResults.loading;


  const formMethods = useForm({
    defaultValues: data,
    mode: "onTouched",
    resolver: yupResolver(UserProfileUpdateValidationSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = formMethods;

  useEffect(() => {
    reset(data?.userProfileRead);
  }, [reset, data]);

  const onSubmit = async (
    newData: yup.InferType<typeof UserProfileUpdateValidationSchema>
  ) => {
    setIsFormError(false);
    try {
      if (appUser) {
        await firstMutation(appUser?.id, newData);

        dispatch(userProfileUpdate({
          firstName: newData.firstName,
          lastName: newData.lastName,
          emailVerified: (
            data?.userProfileRead?.email &&
            newData?.email &&
            data?.userProfileRead?.email !== newData?.email
          )? "no" : undefined
        }));

        toast({
          title: t("toast.title.success", "Success!"),
          description: t("toast.info.datasaved", "The data has been saved"),
          status: "success",
          duration: 6000,
          isClosable: true,
          variant: "subtle",
          position: "bottom-right",
        })

        history.push("/profile");
      } else {
        setIsFormError(true);
      }
    } catch (err) {
      setIsFormError(true);
    }
  };

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.profile.title", "Profile"),
    },
    {
      title: t("module.profile.page.title.updateprofile", "Update profile"),
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
      <FormProvider {...formMethods}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={disableForm}>
            <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
            <ModulePage isLoading={loading} isError={!!error}>
              {(isFormError) && <><TextErrorMessage error="general.writeerror.desc" /><Divider/></>}
              <UpdateForm data={data?.userProfileRead} />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;