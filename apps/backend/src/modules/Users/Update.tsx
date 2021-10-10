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

import { ModuleUsersUpdateSchema } from "./forms";
import { useUserUpdateMutation } from "./hooks";
import {
  useAuthentication,
  useConfig,
  useTypedDispatch,
  useSuccessfullySavedToast,
  useRouter,
} from "~/hooks";
import { userProfileUpdate } from "~/redux/slices/user";

import { Divider } from "@chakra-ui/react";
import { userReadQueryGQL, filteredOutputByWhitelist } from "@culturemap/core";

import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";

import { UserForm } from "./forms";

const Update = () => {
  const router = useRouter();
  const config = useConfig();
  const dispatch = useTypedDispatch();
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const successToast = useSuccessfullySavedToast();
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const { data, loading, error } = useQuery(userReadQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
      scope: config.scope,
    },
  });

  const [firstMutation, firstMutationResults] = useUserUpdateMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(ModuleUsersUpdateSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    reset(
      filteredOutputByWhitelist(data?.userRead, [
        "firstName",
        "lastName",
        "email",
        "role",
        "userBanned",
        "ownsEventImports",
        "ownsConentOnDelete",
      ])
    );
  }, [reset, data]);

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleUsersUpdateSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      if (appUser) {
        const { errors } = await firstMutation(
          parseInt(router.query.id, 10),
          newData
        );

        if (!errors) {
          if (appUser.id === parseInt(router.query.id, 10))
            dispatch(
              userProfileUpdate({
                firstName: newData.firstName,
                lastName: newData.lastName,
                emailVerified:
                  data?.userRead?.email &&
                  newData?.email &&
                  data?.userRead?.email !== newData?.email
                    ? "no"
                    : undefined,
              })
            );

          successToast();
          reset({
            keepValues: true, 
            keepDefaultValus: true
          });
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
      title: t("module.users.title", "Users"),
    },
    {
      title: t("module.users.page.title.updateuser", "Update user"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "userRead",
    },
    {
      type: "submit",
      isLoading: isSubmitting,
      label: t("module.button.update", "Update"),
      userCan: "userUpdate",
    },
  ];

  return (
    <>
      <FormNavigationBlock
        shouldBlock={!isNavigatingAway && isDirty && !isSubmitting}
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
              <UserForm
                action="update"
                data={data?.userRead}
                validationSchema={ModuleUsersUpdateSchema}
              />
            </ModulePage>
          </fieldset>
        </form>
      </FormProvider>
    </>
  );
};
export default Update;
