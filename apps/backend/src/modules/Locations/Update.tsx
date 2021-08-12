import { useState, useEffect } from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { TextErrorMessage, FormNavigationBlock } from "~/components/forms";

import { ModuleLocationValidationSchema } from "./forms";
import { useLocationUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";
import { filteredOutputByWhitelist } from "@culturemap/core";

import { useQuery, gql } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";

import { ModuleForm } from "./forms";
import {
  multiLangJsonToRHFormData,
  multiLangRHFormDataToJson,
  multiLangSlugUniqueError,
} from "~/utils";

import { mapModulesCheckboxArrayToData, mapDataToModulesCheckboxArray } from "./helpers";

export const locationReadAndContentAuthorsQueryGQL = gql`
  query locationRead($id: Int!) {
    locationRead(id: $id) {
      id
      title
      slug
      description
      address
      contactInfo
      offers
      lat
      lng
      status
      ownerId
      createdAt
      updatedAt
      terms {
        id
        name
        slug
      }
    }
    adminUsers(roles: ["administrator", "editor", "contributor"]) {
      id
      firstName
      lastName
    }
    moduleTaxonomies(key: "location") {
      id
      name
      terms {
        id
        name
      }
    }
  }
`;

const Update = () => {
  const router = useRouter();
  const config = useConfig();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();

  const { data, loading, error } = useQuery(
    locationReadAndContentAuthorsQueryGQL,
    {
      variables: {
        id: parseInt(router.query.id, 10),
      },
    }
  );

  const [firstMutation, firstMutationResults] = useLocationUpdateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
    mode: "onTouched",
    resolver: yupResolver(ModuleLocationValidationSchema),
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (!data || !data.locationRead) return;
    
    reset({
      ...multiLangJsonToRHFormData(
        filteredOutputByWhitelist(
          data.locationRead,
          ["ownerId", "lat", "lng", "status"],
          multiLangFields
        ),
        multiLangFields,
        config.activeLanguages
      ),
      ...mapDataToModulesCheckboxArray(data.locationRead.terms, data.moduleTaxonomies),
    });
  }, [reset, data, config.activeLanguages]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleLocationValidationSchema>
  ) => {
    setIsFormError(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation(parseInt(router.query.id, 10), {
          owner: {
            connect: {
              id: newData.ownerId,
            },
          },
          status: newData.status,
          lat: newData.lat,
          lng: newData.lng,
          terms: {
            set: mapModulesCheckboxArrayToData(
              newData,
              data?.moduleTaxonomies
            ),
          },
          ...filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFields,
              config.activeLanguages
            ),
            [],
            multiLangFields
          ),
        });

        if (!errors) {
          successToast();

          router.push(moduleRootPath);
        } else {
          let slugError = multiLangSlugUniqueError(errors, setError);

          if (!slugError) setIsFormError(true);
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
      title: t("module.locations.title", "Locations"),
    },
    {
      title: t("module.locations.location.title.updatepage", "Update location"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "locationRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "locationUpdate",
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
              <ModuleForm
                action="update"
                data={data}
                validationSchema={ModuleLocationValidationSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
