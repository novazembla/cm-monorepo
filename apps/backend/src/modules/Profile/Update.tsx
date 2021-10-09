import { useState, useEffect } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { UserProfileUpdateValidationSchema } from "./forms";
import { useUserProfileUpdateMutation } from "./hooks";
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
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState<number>(0);

  const [disableNavigation, setDisableNavigation] = useState(false);

  const { data, loading, error } = useQuery(userProfileReadQueryGQL, {
    variables: {
      id: appUser?.id ?? 0,
      scope: config.scope,
    },
  });

  const [firstMutation, firstMutationResults] = useUserProfileUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
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
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation(
          appUser?.id,
          filteredOutputByWhitelist(newData, ["firstName", "lastName", "email"])
        );

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
        } else {
          setHasFormError(true);
        }
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
      title: t("module.profile.page.title.updateprofile", "Update profile"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "profileUpdate",
      isDisabled: disableNavigation,
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "profileUpdate",
      isDisabled: disableNavigation,
    },
  ];

  return (
    <>
      <FormNavigationBlock
        shouldBlock={
          (isDirty && !isSubmitting && !isNavigatingAway) ||
          activeUploadCounter > 0
        }
      />
      <FormProvider {...formMethods}>
        <FormScrollInvalidIntoView />
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={disableForm}>
            <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
            <ModulePage isLoading={loading} isError={!!error}>
              {hasFormError && (
                <>
                  <TextErrorMessage error="general.writeerror.desc" />
                  <Divider />
                </>
              )}
              <UpdateForm
                data={data?.userProfileRead}
                setActiveUploadCounter={setActiveUploadCounter}
                disableNavigation={setDisableNavigation}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
