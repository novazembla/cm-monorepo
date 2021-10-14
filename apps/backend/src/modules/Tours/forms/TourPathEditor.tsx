import React, { useRef, useEffect, useState } from "react";

import { Box, Heading } from "@chakra-ui/react";

import "./tourPathEditor.scss";

import { LeafletMapGeoman } from "../utils";
import { useConfig } from "~/hooks";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
// @ts-ignore
import geoJSONLineLength from "geojson-length";

export const TourPathEditor = ({
  tourStops,
  name,
  path,
}: {
  tourStops: any[];
  path: object;
  name: string;
}) => {
  const { setValue, register } = useFormContext();
  const config = useConfig();
  const { t, i18n } = useTranslation();

  const refMapContainer = useRef<HTMLDivElement>(null);
  const refMap = useRef<LeafletMapGeoman>();

  const [geoJSON, setGeoJSON] = useState<any>({});

  let length = 0;
  if (geoJSON && geoJSON?.features && Array.isArray(geoJSON?.features)) {
    length = geoJSON.features.reduce((l: number, f:any) => {
      return l + geoJSONLineLength(f.geometry);
    }, 0)
  }

  useEffect(() => {
    if (!window || !refMapContainer.current || refMap.current) return;

    const bounds = [
      [
        config?.mapOuterBounds?.[0].lat ?? 0,
        config?.mapOuterBounds?.[0].lng ?? 0,
      ],
      [
        config?.mapOuterBounds?.[1].lat ?? 0,
        config?.mapOuterBounds?.[1].lng ?? 0,
      ],
    ];

    refMap.current = new LeafletMapGeoman(
      refMapContainer,
      (gJSON: any) => {
        setGeoJSON(gJSON);
        setValue(name, gJSON, { shouldDirty: true });
      },
      bounds[0][0],
      bounds[0][1],
      bounds[1][0],
      bounds[1][1],
      (bounds[0][0] + bounds[1][0]) / 2,
      (bounds[0][1] + bounds[1][1]) / 2,
      13,
      config.mapStyleUrl ?? "",
      i18n.language as any
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (refMap.current) {
      refMap.current.setTourStops(tourStops);
      refMap.current.loadGeoJson(path);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refMap.current, JSON.stringify(path)]);

  useEffect(() => {
    if (refMap.current) {
      refMap.current.setTourStops(tourStops);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refMap.current, JSON.stringify(tourStops)]);

  return (
    <Box>
      <Heading as="h2" mb="3" mt="10">
        {t("module.tour.heading.tourPath", "Tour path")}
      </Heading>
      <Box className="map" w="100%">
        <Box className="editor" position="relative">
          <Box className="mapcontainer" ref={refMapContainer}></Box>
          <Box position="absolute" bottom="2" left="2" zIndex="9999" p="1" bg="#fff" borderRadius="md" border="1px solid" fontSize="sm" borderColor="gray.400">~{(length / 1000).toFixed(2)} km</Box>
        </Box>
      </Box>
      <input type="hidden" {...register(name)} />
    </Box>
  );
};
