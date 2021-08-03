import { useTranslation } from "react-i18next";
import {ModuleSubNav, ButtonListElement, ModulePage} from "~/components/modules";


import { moduleRootPath } from './moduleConfig';

const Add = () => {
  const {t} = useTranslation();

  const breadcrumb = [{
    path: moduleRootPath,
    title: t("module.users.title", "Users")
  },{
    title: t("module.users.page.title.adduser", "Add user")
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
      label: t("module.user.button.add", "Add new user"),
      userCan: "userCreate",
    },
  ];

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage>
        <h1>{t("module.users.page.title.adduser", "Add user")}</h1>
      </ModulePage>
    </>
  )
}
export default Add