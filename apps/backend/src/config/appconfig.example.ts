
import { AppConfigSettings } from "./config";

// this is the full list of the keys that are used for custom settings.
// replace "none"
// export type AppConfigSettingsFiledKeys = "none";
// the keys of the settings
// export type AppConfigSettingsFiledKeys = "phonenumber" | ....

export const appConfig: AppConfigSettings = {
  scope: "backend", // Used throughout the site and the API to identify a client/scope
  enableOpenRegistration: true, // If true new users can register via the website
  defaultPageSize: 50,
  defaultLanguage: "en",
  activeLanguages: ["en","de"],
  // settings: {
  //   phonenumber: {
  //     // ^-- key will be used as field name in the database, should be unique
  //     type: "text", // any HTML input field type or a custom rendered (for more complex fields)
  //     // t("settings.nameofyoursetting.label", "Label")
  //     label: "settings.nameofyoursetting.label",
  //     required: true, // or false
  //     defaultValue: undefined,
  //     validationSchema: ___, // your custom yup validation schama needs to be object().shape(...) as the schemas will be merged object().shape({email:string(),emailconfirm:string()})
  //   },
  // }, // TODO: what else is needed?
  mapOuterBounds: [
    {
      lat: 52.71218794157272,
      lng: 13.000360654958342,
    },
    {
      lat: 52.29188494426961,
      lng: 13.813182965630787,
    },
  ],
  mapStyleUrl:
    "https://example.com/lichtenberg/osm_liberty_berlin.json",
};
export default appConfig;
