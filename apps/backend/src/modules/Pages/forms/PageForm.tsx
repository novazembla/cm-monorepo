import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FieldMultiLang, FieldSelect, FieldRow } from "~/components/forms";

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
  const { t } = useTranslation();
  const { register } = useFormContext();

  let updateActions;

  if (action === "update") {
    if (data.adminUsers) {
      updateActions = (
        <FieldRow><FieldSelect
          id="authorId"
          label={t("module.pages.forms.field.label.author", "Page author")}
          isRequired={true}
          options={data.adminUsers.map((auth) => ({
            value: auth.id,
            label: `${auth.firstName} ${auth.lastName}`,
          }))}
          settings={{
            defaultValue: data.pageRead.authorId,
            placeholder: t(
              "module.pages.forms.field.placeholder.author",
              "Please choose the pages's author"
            ),
          }}
          {...register("authorId")}

        /></FieldRow>
      );
    } else {
      updateActions = (
        <input value={data.pageRead.authorId} {...register("authorId")} />
      );
    }
  }
  return (
    <>
      <FieldMultiLang
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
      <FieldMultiLang
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
      <FieldMultiLang
        name="content"
        id="content"
        type="text"
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

      {updateActions}
    </>
  );
};
export default PageForm;
