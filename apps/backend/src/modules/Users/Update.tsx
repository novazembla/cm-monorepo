import { useTranslation } from "react-i18next";
import {ModuleSubNav, ModulePage, ButtonListElement} from "~/components/modules";

const moduleRootPath = "/users";

const Update = () => {
  const {t} = useTranslation();

  const breadcrumb = [{
    path: moduleRootPath,
    title: t("module.users.title", "Users")
  },{
    title: t("module.users.page.title.updateuser", "Update user")
  }];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
      userCan: "userRead",
    },
    {
      type: "submit",
      isLoading: false, //isSubmitting,
      label: t("module.user.button.update", "Update user"),
      userCan: "userCreate",
    },
  ];

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage>
        <h1>{t("module.users.page.title.updateuser", "Update user")}</h1>
      </ModulePage>
    </>
  )


}
export default Update