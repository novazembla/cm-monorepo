import { useState, useEffect } from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { TextErrorMessage, FormNavigationBlock } from "~/components/forms";

import { useSettingsUpdateMutation } from "~/hooks/mutations";
import { useAuthentication, useTypedDispatch, useSuccessfullySavedToast } from "~/hooks";
import { settingsSet } from "~/redux/slices/settings";

import { Divider } from "@chakra-ui/react";
import { settingsQueryGQL, filteredOutputByWhitelist } from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { AppSettings } from "~/config";

import { moduleRootPath } from "./moduleConfig";

import { UpdateForm } from "./forms";
import {
  getSettingsFieldKeys,
  getSettingsValidationSchema,
  getSettingsFieldDefinitions,
  AppSettingField,
  AppSettingsFieldKeys,
} from "~/config";

const Update = () => {
  const dispatch = useTypedDispatch();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();

  const { data, loading, error } = useQuery(settingsQueryGQL);

  const history = useHistory();
  const [firstMutation, firstMutationResults] = useSettingsUpdateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const settingsValidationSchema = getSettingsValidationSchema();

  const formMethods = useForm({
    mode: "onTouched",
    resolver: yupResolver(settingsValidationSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    reset(filteredOutputByWhitelist(data?.settings, getSettingsFieldKeys()));
  }, [reset, data]);

  const onSubmit = async (
    newData: yup.InferType<typeof settingsValidationSchema>
  ) => {
    setIsFormError(false);
    try {
      if (appUser) {
        const fieldDefinitions = getSettingsFieldDefinitions();

        const mutationData = (
          Object.keys(fieldDefinitions) as AppSettingsFieldKeys[]
        ).map((key) => {
          const fieldDef: AppSettingField = fieldDefinitions[
            key
          ] as AppSettingField;
          return {
            key,
            value: fieldDef.getUpdateValue
              ? fieldDef.getUpdateValue(fieldDef, newData)
              : newData[key],
          };
        });
        
        const { errors } = await firstMutation(mutationData);
        
        if (!errors) {
          const settingInRedux = (
            Object.keys(fieldDefinitions) as AppSettingsFieldKeys[]
          ).reduce((acc, key) => {
            const fieldDef: AppSettingField = fieldDefinitions[
              key
            ] as AppSettingField;
            return {
              ...acc,
              [key]: fieldDef.getUpdateValue
                ? fieldDef.getUpdateValue(fieldDef, newData)
                : newData[key],
            };
          }, {} as AppSettings);

          dispatch(settingsSet(settingInRedux));

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
              <UpdateForm data={data?.settings} />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
