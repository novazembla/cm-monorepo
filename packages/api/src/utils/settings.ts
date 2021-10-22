import { Setting } from "@prisma/client";

export const parseSettings = (settings: Setting[] | null | undefined): any => {
  if (!settings || !Array.isArray(settings)) return {};

  return settings.reduce((acc, setting: any) => {
    return {
      ...acc,
      [setting.key]: setting?.value?.json,
    };
  }, {});
};
