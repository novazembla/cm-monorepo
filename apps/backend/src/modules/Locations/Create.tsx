import { useState } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { filteredOutputByWhitelist, PublishStatus } from "@culturemap/core";
import { useQuery, gql } from "@apollo/client";
import pick from "lodash/pick";

import {
  TextErrorMessage,
  FormNavigationBlock,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import { ModuleLocationCreateSchema } from "./forms";
import { useLocationCreateMutation } from "./hooks";
import {
  useAuthentication,
  useSuccessfullySavedToast,
  useRouter,
  useConfig,
} from "~/hooks";

import { Divider } from "@chakra-ui/react";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";

import { ModuleForm } from "./forms";
import { multiLangRHFormDataToJson, multiLangSlugUniqueError } from "~/utils";
import { mapModulesCheckboxArrayToData } from "./helpers";

export const locationReadGetTaxonomies = gql`
  query locationRead {
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

const Create = () => {
  const config = useConfig();
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const [firstMutation, firstMutationResults] = useLocationCreateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleLocationCreateSchema),
  });

  const { data, loading, error } = useQuery(locationReadGetTaxonomies, {
    variables: {
      id: parseInt(router.query.id, 10),
    },
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleLocationCreateSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const mutationResults = await firstMutation({
          owner: {
            connect: {
              id: appUser.id,
            },
          },
          lat: newData.lat,
          lng: newData.lng,
          status: PublishStatus.DRAFT,
          eventLocationId: newData.eventLocationId ? parseInt(newData.eventLocationId) : undefined,
          agency: newData.agency,
          terms: {
            connect: mapModulesCheckboxArrayToData(
              newData,
              data?.moduleTaxonomies
            ),
          },
          address: pick(newData, [
            "co",
            "street1",
            "street2",
            "houseNumber",
            "city",
            "postCode",
          ]),
          contactInfo: pick(newData, [
            "email1",
            "email2",
            "phone1",
            "phone2",
          ]),
          socialMedia: pick(newData, [
            "facebook",
            "twitter",
            "instagram",
            "youtube",
            "website",
          ]),
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

        if (!mutationResults.errors) {
          successToast();
          setIsNavigatingAway(true);
          router.push(
            `${moduleRootPath}/update/${mutationResults.data?.locationCreate?.id}`
          );
        } else {
          let slugError = multiLangSlugUniqueError(
            mutationResults.errors,
            setError
          );
            

          if (!slugError) setHasFormError(true);
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
      title: t("module.locations.title", "Locations"),
    },
    {
      title: t("module.locations.menuitem.createlocation", "Add new location"),
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
      label: t("module.button.savedraft", "Save draft"),
      userCan: "locationCreate",
    },
  ];

  return (
    <>
      <FormNavigationBlock
        shouldBlock={!isNavigatingAway && isDirty && !isSubmitting}
      />
      <FormProvider {...formMethods}>
        <FormScrollInvalidIntoView hasFormError={hasFormError} />
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
              <ModuleForm
                action="create"
                data={data}
                validationSchema={ModuleLocationCreateSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Create;
