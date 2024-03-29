import React from "react";
import { ImageStatus } from "@culturemap/core";
import type { ApiImageMetaInformation } from "@culturemap/core";
import { Box, Flex, Text, Img } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { BeatLoader } from "react-spinners";

import { useImageStatusPoll } from "~/hooks";

export type ApiImageProps = {
  id: number | undefined;
  alt: string;
  meta?: ApiImageMetaInformation;
  status: ImageStatus;
  forceAspectRatioPB?: number;
  useImageAspectRatioPB?: boolean;
  showPlaceholder?: boolean;
  placeholder?: string;
  sizes?: string;
  objectFit?: string;
  objectPosition?: string;
};

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
  objectFit = "contain",
  objectPosition = "center center",
}: ApiImageProps) => {
  const { t } = useTranslation();

  const [polledStatus, polledMeta] = useImageStatusPoll(id, status);

  let content;
  let imageAspectRatioPB;

  if (status === ImageStatus.READY || polledStatus === ImageStatus.READY) {
    const aSizes =
      meta?.availableSizes ?? polledMeta?.availableSizes ?? undefined;

    if (aSizes) {
      const originalUrl = aSizes.original?.url ?? "";
      const originalWidth = aSizes.original?.width ?? 0;
      const originalHeight = aSizes.original?.height ?? 0;

      if (useImageAspectRatioPB && originalWidth > 0)
        imageAspectRatioPB = Math.floor(
          (originalHeight / originalWidth) * 100
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
            <Img
              src={originalUrl}
              alt={alt}
              width={originalWidth}
              height={originalHeight}
              objectFit={(objectFit ?? "contain") as any}
              objectPosition={(objectPosition ?? "center center") as any}
            />
          </picture>
        );
      }
    }
  }

  if (
    !content &&
    (status === ImageStatus.ERROR || polledStatus === ImageStatus.ERROR)
  )
    content = (
      <Flex
        justifyContent="center"
        alignItems="center"
        fontSize="lg"
        color="#fff"
        bg="red.400"
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
    (status === ImageStatus.UPLOADED ||
      status === ImageStatus.PROCESSING ||
      status === ImageStatus.FAILEDRETRY)
  )
    content = (
      <Flex
        justifyContent="center"
        alignItems="center"
        direction="column"
        fontSize="md"
        color="gray.800"
        border="1px solid"
        bg="green.200"
        borderColor="gray.400"
        minH="100%"
        p="4"
        textAlign="center"
      >
        <Text pb="4" w="90%" color="#fff">
          {t(
            "apiimage.processsing",
            "Image uploaded. We are processing it now"
          )}
        </Text>

        <BeatLoader color="#fff" />
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

  if (content && (forceAspectRatioPB || imageAspectRatioPB)) {
    const aPB = forceAspectRatioPB ?? imageAspectRatioPB;
    content = (
      <Box className="aspect" pb={`${aPB}%`}>
        <Box className="ratio">{content}</Box>
      </Box>
    );
  }

  return <>{content}</>;
};
