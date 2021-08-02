import { useState, useEffect } from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { TextErrorMessage } from "~/components/forms";

import { UserProfileUpdateValidationSchema } from "~/validation";
import { useUserProfileUpdateMutation } from "~/hooks/mutations";
import {
  useAuthentication,
  useConfig,
  useTypedDispatch,
  useSuccessToast,
} from "~/hooks";
import { settingUpdate } from "~/redux/slices/settings";

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

import { moduleRootPath } from "./config";

import { UpdateForm } from "./forms";

const Update = ({ key }: { key: string }) => {
  const config = useConfig();
  const dispatch = useTypedDispatch();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessToast();

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
    mode: "onTouched",
    resolver: yupResolver(UserProfileUpdateValidationSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
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
            settingUpdate({
              key: newData.key,
              value: null,
            })
          );

          successToast();
          history.push("/settings");
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
      title: t("module.settings.title", "Settings"),
    },
    {
      title: t("module.settings.page.title.updatesettings", "Update settings"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "settingRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "settingUpdate",
    },
  ];

  return (
    <>
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
