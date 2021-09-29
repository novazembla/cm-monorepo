import { useState } from "react";
import type * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { filteredOutputByWhitelist, PublishStatus } from "@culturemap/core";
import { useQuery, gql } from "@apollo/client";

import { TextErrorMessage, FormNavigationBlock } from "~/components/forms";

import { ModuleEventCreateSchema } from "./forms";
import { useEventCreateMutation } from "./hooks";
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

export const eventReadGetTaxonomies = gql`
  query eventRead {
    moduleTaxonomies(key: "event") {
      id
      name
      terms {
        id
        name
      }
    }

    locations(pageSize: 1000) {
      locations {
        id
        title
      }
    }
  }
`;

// TAX NOT REQUIRED EVEN THOUGH IT IS REQUIRED, why? TODO:

const Create = () => {
  const config = useConfig();
  const router = useRouter();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  
  const [firstMutation, firstMutationResults] = useEventCreateMutation();
  const [isFormError, setIsFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleEventCreateSchema),
    defaultValues: {
      dates: [
        {
          date: new Date(),
          begin: new Date(new Date().setHours(10, 0, 0)),
          end: new Date(new Date().setHours(18, 0, 0)),
        },
      ],
    },
  });

  const { data, loading, error } = useQuery(eventReadGetTaxonomies, {
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
    newData: yup.InferType<typeof ModuleEventCreateSchema>
  ) => {
    
    setIsFormError(false);
    setIsNavigatingAway(false);

    try {
      if (appUser) {
        const mutationResults = await firstMutation({
          owner: {
            connect: {
              id: appUser.id,
            },
          },
          locations: {
            connect: {
              id: newData.locationId,
            }
          },
          dates: {
            create: newData.dates,
          },
          lat: newData.lat,
          lng: newData.lng,
          status: PublishStatus.DRAFT,
          terms: {
            connect: mapModulesCheckboxArrayToData(
              newData,
              data?.moduleTaxonomies
            ),
          },
          ...filteredOutputByWhitelist(
            multiLangRHFormDataToJson(
              newData,
              multiLangFields,
              config.activeLanguages ?? ["en"]
            ),
            [],
            multiLangFields
          ),
        }); 

        // TODO Image

        if (!mutationResults.errors) {
          successToast();

    setIsNavigatingAway(true);
          router.push(`${moduleRootPath}/update/${mutationResults.data?.eventCreate?.id}`);
        } else {
          let slugError = multiLangSlugUniqueError(mutationResults.errors, setError);

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
      title: t("module.events.title", "Events"),
    },
    {
      title: t("module.events.mneuitem.createevent", "Add new event"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "eventRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.savedraft", "Save draft"),
      userCan: "eventCreate",
    },
  ];

  return (
    <>
      <FormNavigationBlock shouldBlock={!isNavigatingAway && isDirty && !isSubmitting} />
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
                action="create"
                data={data}
                validationSchema={ModuleEventCreateSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Create;
