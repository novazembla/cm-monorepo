
import { AppConfig } from "./config";

export const appConfig: AppConfig = {
  scope: "backend", // Used throughout the site and the API to identify a client/scope
  enableRegistration: true, // If true new users can register via the website
  // settings: {
  //   latitude: {
  //     // ^-- key will be used as field name in the database, should be unique
  //     type: "text", // any HTML input field type or a custom rendered (for more complex fields)
  //     // t("settings.nameofyoursetting.label", "Label")
  //     label: "settings.nameofyoursetting.label",
  //     required: true, // or false
  //     defaultValue: undefined,
  //     validationSchema: ___, // your custom yup validation schama needs to be object().shape(...) as the schemas will be merged object().shape({email:string(),emailconfirm:string()})
  //   },
  // }, // TODO: what else is needed?
};
export default appConfig;
