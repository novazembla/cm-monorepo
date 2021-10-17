import {
  multiLangTranslationsJsonRHFormData,
  multiLangImageMetaRHFormFieldsDataToJson,
} from ".";
import { getAppConfig } from "~/config";

export const fieldImagesParseIncomingImages = (images: any) => {
  const config = getAppConfig();

  if (!images) return [];

  if (Array.isArray(images))
    return images.reduce((acc, img) => {
      try {
        acc.push({
          id: img.id,
          status: img.status,
          meta: img.meta,
          ...multiLangTranslationsJsonRHFormData(
            img,
            ["alt", "credits"],
            config.activeLanguages
          ),
        });
      } catch (err) {}
      return acc;
    }, []);

  return [];
};

export const fieldImagesRFHFormDataToData = (data: any) => {
  const config = getAppConfig();
  let images = {};
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    const configuredImages = data.images.filter((image: any) => image.id);
    if (configuredImages && configuredImages.length > 0) {
      images = {
        images: {
          set: configuredImages.map((image: any) => ({
            id: image.id,
          })),
          update: configuredImages.map((image: any, index: any) => ({
            where: {
              id: image.id,
            },
            data: {
              orderNumber: index,
              ...multiLangImageMetaRHFormFieldsDataToJson(
                image,
                ["alt", "credits"],
                config.activeLanguages
              ),
            },
          })),
        },
      };
    }
  }
  return images;
};
