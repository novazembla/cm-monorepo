import { useState, useEffect } from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { TextErrorMessage, FormNavigationBlock } from "~/components/forms";

import { UserProfileUpdateValidationSchema } from "~/validation";
import { useUserProfileUpdateMutation } from "~/hooks/mutations";
import {
  useAuthentication,
  useConfig,
  useTypedDispatch,
  useSuccessfullySavedToast,
} from "~/hooks";
import { userProfileUpdate } from "~/redux/slices/user";

import { Divider } from "@chakra-ui/react";
import {
  userProfileReadQueryGQL,
  filteredOutputByWhitelist,
} from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";

import { UpdateForm } from "./forms";

const Update = () => {
  const config = useConfig();
  const dispatch = useTypedDispatch();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();

  const { data, loading, error } = useQuery(userProfileReadQueryGQL, {
    variables: {
      id: appUser?.id ?? 0,
      scope: config.scope,
    },
  });

  const history = useHistory();
  const [firstMutation, firstMutationResults] = useUserProfileUpdateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
    mode: "onTouched",
    resolver: yupResolver(UserProfileUpdateValidationSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    reset(
      filteredOutputByWhitelist(data?.userProfileRead, [
        "firstName",
        "lastName",
        "email",
      ])
    );
  }, [reset, data]);

  const onSubmit = async (
    newData: yup.InferType<typeof UserProfileUpdateValidationSchema>
  ) => {
    setIsFormError(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation(appUser?.id, newData);

        if (!errors) {
          dispatch(
            userProfileUpdate({
              firstName: newData.firstName,
              lastName: newData.lastName,
              emailVerified:
                data?.userProfileRead?.email &&
                newData?.email &&
                data?.userProfileRead?.email !== newData?.email
                  ? "no"
                  : undefined,
            })
          );

          successToast();

          history.push("/profile");
          
        } else {
          setIsFormError(true);
        }
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
      <FormNavigationBlock shouldBlock={isDirty && !isSubmitting} />     
      <FormProvider {...formMethods}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={disableForm}>
            <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
            <ModulePage isLoading={loading} isError={!!error}>
              {isFormError && (
                <>
                  <TextErrorMessage error="general.writeerror.desc" />
                  <Divider />
                </>
              )}
              <UpdateForm data={data?.userProfileRead} />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
