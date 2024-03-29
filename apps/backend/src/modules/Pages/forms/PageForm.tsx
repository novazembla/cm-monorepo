import { Box, Divider, Alert, AlertIcon, chakra } from "@chakra-ui/react";
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
import FieldMultiLangTextarea from "~/components/forms/FieldMultiLangTextarea";
import { useAuthentication } from "~/hooks";

export const PageForm = ({
  data,
  errors,
  action,
  validationSchema,
  setActiveUploadCounter,
}: {
  data?: any;
  errors?: any;
  validationSchema: any;
  action: "create" | "update";
  setActiveUploadCounter?: Function;
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
                ownerId={data.page.ownerId}
                module="page"
                status={data?.page?.status}
              />
            </FieldRow>
            <FieldRow>
              <FieldSelect
                name="ownerId"
                id="ownerId"
                label={t("module.forms.field.label.author", "Author")}
                isDisabled={
                  !(
                    appUser &&
                    (appUser.has("editor") || data.page.ownerId === appUser.id)
                  )
                }
                isRequired={true}
                options={data.adminUsers.map((authUser: any) => ({
                  value: authUser.id,
                  label: `${authUser.firstName} ${authUser.lastName}`,
                }))}
                settings={{
                  defaultValue: data.page.ownerId,
                  placeholder: t(
                    "module.forms.field.placeholder.author",
                    "Please choose the author"
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
            currentImage={data?.page?.heroImage}
            setActiveUploadCounter={setActiveUploadCounter}
            settings={{
              imageRequired: false,
              altRequired: false,
              creditsRequired: false,
            }}
            doNotCollectCropPosition={true}
            connectWith={{
              heroImagePages: {
                connect: {
                  id: data?.page?.id,
                },
              },
            }}
          />
        </>
      );
    } else {
      updateActions = (
        <input value={data?.page?.ownerId} {...register("ownerId")} />
      );
    }
  }
  return (
    <Box w="100%">
      {action === "create" && (
        <>
          <Alert borderRadius="lg">
            <AlertIcon />
            {t(
              "form.info.pleasesafedraft",
              "Please save a draft to unlock further functionality"
            )}
          </Alert>
        </>
      )}

      <FieldMultiLangInput
        name="title"
        id="title"
        type="text"
        label={t("module.pages.forms.page.field.label.title", "Title")}
        isRequired={true}
        settings={{
          defaultValues: data?.page?.title,
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
          defaultValues: data?.page?.slug,
          placeholder: t(
            "module.pages.forms.page.field.placeholder.slug",
            "Slug / URL part"
          ),
        }}
      />
      {updateActions}
      <Divider mt="10" />
      <FieldMultiLangTextEditor
        name="intro"
        id="intro"
        type="full"
        label={t("module.pages.forms.page.field.label.intro", "Intro")}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.page?.intro,
          placeholder: t(
            "module.pages.forms.page.field.placeholder.intro",
            "Page's introduction block"
          ),
        }}
      />
      <Divider mt="10" />
      <FieldMultiLangTextEditor
        name="content"
        id="content"
        type="full"
        size="large"
        label={t("module.pages.forms.page.field.label.content", "Content")}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.page?.content,
          placeholder: t(
            "module.pages.forms.page.field.placeholder.content",
            "Page content"
          ),
        }}
      />

      <Divider mt="10" />

      <chakra.fieldset
        border="1px solid"
        borderColor="gray.400"
        p="4"
        borderRadius="md"
        w="100%"
      >
        <legend>
          <chakra.span px="2">
            {t("module.locations.forms.fieldSet.label.seo", "SEO")}
          </chakra.span>
        </legend>
        <FieldMultiLangTextarea
          name="metaDesc"
          id="metaDesc"
          type="basic"
          label={t(
            "module.locations.forms.location.field.label.metaDesc",
            "Meta Description"
          )}
          isRequired={false}
          settings={{
            defaultRequired: false,
            defaultValues: data?.page?.metaDesc,
            maxLength: 350,
          }}
        />
      </chakra.fieldset>
    </Box>
  );
};
export default PageForm;
