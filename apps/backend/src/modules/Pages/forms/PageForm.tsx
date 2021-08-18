import { Box, Divider, Alert, AlertIcon } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FieldMultiLangInput,
  FieldMultiLangTextEditor,
  FieldSelect,
  FieldRow,
  FieldPublishStatusSelect,
  TwoColFieldRow,
  FieldSingleImage,
} from "~/components/forms";
import { useAuthentication } from "~/hooks";

export const PageForm = ({
  data,
  errors,
  action,
  validationSchema,
}: {
  data?: any;
  errors?: any;
  validationSchema: any;
  action: "create" | "update";
}) => {
  const [appUser] = useAuthentication();
  const { t } = useTranslation();
  const { register } = useFormContext();

  let updateActions;

  
  if (action === "update") {
    if (data?.adminUsers) {
      updateActions = (
        <>
          <Divider mt="10" />
          <TwoColFieldRow>
            <FieldRow>
              <FieldPublishStatusSelect
                ownerId={data.pageRead.ownerId}
                module="page"
                status={data?.pageRead?.status}
              />
            </FieldRow>
            <FieldRow>
              <FieldSelect
                name="ownerId"
                id="ownerId"
                label={t(
                  "module.pages.forms.field.label.author",
                  "Page author"
                )}
                isDisabled={
                  !(
                    appUser &&
                    (appUser.has("editor") ||
                      data.pageRead.ownerId === appUser.id)
                  )
                }
                isRequired={true}
                options={data.adminUsers.map((authUser: any) => ({
                  value: authUser.id,
                  label: `${authUser.firstName} ${authUser.lastName}`,
                }))}
                settings={{
                  defaultValue: data.pageRead.ownerId,
                  placeholder: t(
                    "module.pages.forms.field.placeholder.author",
                    "Please choose the pages's author"
                  ),
                }}
              />
            </FieldRow>
          </TwoColFieldRow>
          <Divider mt="10" />
          <FieldSingleImage
            id="heroImage"
            name="heroImage"
            label={t("forms.heroImage.label", "Featured image")}
            currentImage={data?.pageRead?.heroImage}
            settings={{
              imageRequired: false,
              altRequired: false,
              creditsRequired: false,
            }}
            connectWith={{
              heroImagePages: {
                connect: {
                  id: data?.pageRead?.id,            
                }
              }
            }}
          />
        </>
      );
    } else {
      updateActions = (
        <input value={data?.pageRead?.ownerId} {...register("ownerId")} />
      );
    }
  }
  return (
    <Box w="100%">
      {action === "create" && <>
      
      <Alert borderRadius="lg">
      <AlertIcon />
  {t("form.info.pleasesafedraft", "Please save a draft to unlock further functionality")}
      </Alert>
    </>}

      <FieldMultiLangInput
        name="title"
        id="title"
        type="text"
        label={t("module.pages.forms.page.field.label.title", "Title")}
        isRequired={true}
        settings={{
          defaultValues: data?.pageRead?.title,
          placeholder: t(
            "module.pages.forms.page.field.placeholder.title",
            "Page title"
          ),
        }}
      />
      <FieldMultiLangInput
        name="slug"
        id="slug"
        type="text"
        label={t("module.pages.forms.page.field.label.slug", "Slug")}
        isRequired={true}
        settings={{
          defaultValues: data?.pageRead?.slug,
          placeholder: t(
            "module.pages.forms.page.field.placeholder.slug",
            "Slug / URL part"
          ),
        }}
      />
      {updateActions}
      
      <Divider mt="10" />
      <FieldMultiLangTextEditor
        name="content"
        id="content"
        type="basic"
        label={t("module.pages.forms.page.field.label.content", "Content")}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.pageRead?.content,
          placeholder: t(
            "module.pages.forms.page.field.placeholder.content",
            "Page content"
          ),
        }}
      />
    </Box>
  );
};
export default PageForm;
