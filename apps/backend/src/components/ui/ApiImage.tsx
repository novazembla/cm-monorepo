import React from "react";
import { ImageStatusEnum } from "@culturemap/core";
import type { ApiImageMetaInformation } from "@culturemap/core";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { BeatLoader } from "react-spinners";

import { useImageStatusPoll } from "~/hooks";

export type ApiImageProps = {
  id: number | undefined;
  alt: string;
  meta?: ApiImageMetaInformation;
  status: ImageStatusEnum;
  forceAspectRatioPB?: number;
  useImageAspectRatioPB?: boolean;
  showPlaceholder?: boolean;
  placeholder?: string;
  sizes?: string;
}

export const ApiImage = ({
  id,
  alt,
  meta,
  status,
  useImageAspectRatioPB,
  forceAspectRatioPB,
  placeholder,
  showPlaceholder,
  sizes = "100vw",
}: ApiImageProps) => {
  const { t } = useTranslation();

  const [polledStatus, polledMeta] = useImageStatusPoll(id, status);

  let content;
  let imageAspectRationPB;

  if (
    status === ImageStatusEnum.READY ||
    polledStatus === ImageStatusEnum.READY
  ) {
    const aSizes =
      meta?.availableSizes ?? polledMeta?.availableSizes ?? undefined;

    if (aSizes) {
      const originalUrl = aSizes.original?.url ?? "";
      const originalWidth = aSizes.original?.width ?? 0;
      const originalHeight = aSizes.original?.width ?? 0;

      if (useImageAspectRatioPB && originalWidth > 0)
        imageAspectRationPB = Math.floor(
          (originalHeight / originalHeight) * 100
        );

      const sourceWebp = Object.keys(aSizes).reduce((acc: any, key: any) => {
        const size = aSizes[key];
        if (!size.isWebP) return acc;

        acc.push(`${size.url} ${size.width}w`);
        return acc;
      }, [] as string[]);

      const sourceJpg = Object.keys(aSizes).reduce((acc: any, key: any) => {
        const size = aSizes[key];
        if (!size.isJpg) return acc;

        acc.push(`${size.url} ${size.width}w`);
        return acc;
      }, [] as string[]);

      if (originalUrl) {
        content = (
          <picture>
            {sourceWebp && sourceWebp.length > 0 && (
              <source
                srcSet={sourceWebp.join(",")}
                sizes={sizes}
                type="image/webp"
              />
            )}
            {sourceJpg && sourceJpg.length > 0 && (
              <source
                srcSet={sourceJpg.join(",")}
                sizes={sizes}
                type="image/jpeg"
              />
            )}
            <img
              src={originalUrl}
              alt={alt}
              width={originalWidth}
              height={originalHeight}
            />
          </picture>
        );
      }
    }
  }

  if (
    !content &&
    (status === ImageStatusEnum.ERROR || polledStatus === ImageStatusEnum.ERROR)
  )
    content = (
      <Flex
        justifyContent="center"
        alignItems="center"
        fontSize="lg"
        color="gray.800"
        border="2px solid"
        bg="red.100"
        borderColor="red.100"
        minH="200px"
        p="4"
        textAlign="center"
      >
        {t(
          "apiimage.errormsg",
          "The image could unfortunately not be processed. Please try uploading again."
        )}
      </Flex>
    );

  if (
    !content &&
    (status === ImageStatusEnum.UPLOADED ||
      status === ImageStatusEnum.PROCESSING ||
      status === ImageStatusEnum.FAILEDRETRY)
  )
    content = (
      <Flex
        justifyContent="center"
        alignItems="center"
        direction="column"
        fontSize="lg"
        color="gray.800"
        border="2px solid"
        bg="green.200"
        borderColor="green.200"
        minH="200px"
        p="4"
        textAlign="center"
      >
        <Text pb="4">
          {t(
            "apiimage.processsing",
            "Image successful uploaded. We are processing it now"
          )}
        </Text>

        <BeatLoader />
      </Flex>
    );

  if ((!content || !id) && showPlaceholder)
    content = (
      <Flex
        justifyContent="center"
        alignItems="center"
        fontSize="lg"
        color="gray.800"
        border="2px solid"
        bg="gray.100"
        borderColor="gray.100"
        minH="200"
        h="100%"
        p="4"
        textAlign="center"
      >
        {" "}
        {placeholder ?? t("apiimage.placeholder", "Image")}
      </Flex>
    );

  if (content && (forceAspectRatioPB || imageAspectRationPB)) {
    const aPB = forceAspectRatioPB ?? imageAspectRationPB;
    content = (
      <Box className="aspect" pb={`${aPB}%`}>
        <Box className="ratio">{content}</Box>
      </Box>
    );
  }

  return <>{content}</>;
};
