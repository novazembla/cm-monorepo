import { useTranslation } from "react-i18next";
import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";

const Index = () => {
  const { t } = useTranslation();
  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.users.title", "Users"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: "/users/create",
      label: t("module.users.button.create", "Add user"),
      userCan: "userCreate",
    },
    {
      type: "navigation",
      to: "/users/update/123",
      label: t("module.users.button.update", "Edit user"),
      userCan: "userUpdate",
    },
  ];

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage>
        <h2>Page Dashboard</h2>
        <p>
          HERE SHOULD an alert be shown if the user has not cofirmed her
          email...
        </p>

        <p>INDEX</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
          sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
          tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque
          in ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero
          eu facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar
          sit amet lectus. Quisque molestie dapibus libero non pellentesque.
          Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
          Nulla felis velit, ornare ac porttitor ut, rhoncus eu ipsum. Donec
          auctor efficitur est vel congue. Nunc at nunc quis massa facilisis
          fermentum. Vivamus fringilla nunc vitae justo consectetur, aliquam
          gravida nisl mollis.
        </p>
      </ModulePage>
    </>
  );
};
export default Index;
