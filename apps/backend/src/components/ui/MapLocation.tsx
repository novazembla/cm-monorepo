import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Grid, Box, AspectRatio, Text } from "@chakra-ui/react";

import L from "leaflet";
import "maplibre-gl";
import "@maplibre/maplibre-gl-leaflet";
import "leaflet/dist/leaflet.css";

import { FieldInput, FieldRow } from "../forms";

import type { GeoLocation } from "~/types";
import { useConfig } from "~/hooks";

import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

class LeafletLocationDisplay {
  pin: L.Marker | undefined;
  map: L.Map | undefined;

  constructor(
    refContainer: React.RefObject<HTMLDivElement>,
    mapBounds: [GeoLocation, GeoLocation],
    zoom: number,
    style: string
  ) {
    if (refContainer?.current) {
      this.map = L.map(refContainer.current, {
        maxBounds: [
          [mapBounds[0].lat, mapBounds[0].lng],
          [mapBounds[1].lat, mapBounds[1].lng],
        ],
        zoom,
        minZoom: 11,
      });

      // @ts-ignore
      L.maplibreGL({
        style,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">Openstreet Map Contributors</a>',
      }).addTo(this.map);

      this.pin = undefined;
    } else {
      throw Error("LeafLetMapGeopMan MapContainer Ref not set");
    }
  }

  setPoint(geolocation: GeoLocation) {
    if (!this.map) return;

    if (!this.pin) {
      this.pin = L.marker(L.latLng(geolocation.lat, geolocation.lng), {}).addTo(
        this.map
      );
    } else {
      this.pin.setLatLng(new L.LatLng(geolocation.lat, geolocation.lng));
    }
    this.map.panTo(new L.LatLng(geolocation.lat, geolocation.lng));
  }
}

export const MapLocation = ({
  lat,
  lng,
  required,
  fieldNameLat = "lat",
  fieldNameLng = "lng",
}: {
  lat: number;
  lng: number;
  required: boolean;
  fieldNameLat?: string;
  fieldNameLng?: string;
}) => {
  const { t } = useTranslation();
  const config = useConfig();

  const refMapContainer = useRef<HTMLDivElement>(null);
  const refMap = useRef<LeafletLocationDisplay>();

  useEffect(() => {
    if (
      !window ||
      !refMapContainer.current ||
      !config.mapOuterBounds ||
      !config.mapStyleUrl
    )
      return;

    if (!refMap.current)
      refMap.current = new LeafletLocationDisplay(
        refMapContainer,
        config.mapOuterBounds,
        13,
        config.mapStyleUrl
      );

    refMap.current.setPoint({
      lat,
      lng,
    });
  }, [lat, lng, config.mapOuterBounds, config.mapStyleUrl]);

  return (
    <Grid
      w="100%"
      templateColumns={{ base: "100%", t: "1fr 1fr" }}
      templateRows={{ base: "auto 1fr", t: "auto" }}
      gap={{ base: "4", s: "6" }}
      mt="2"
    >
      <Box>
        <AspectRatio ratio={16 / 9}>
          <Box w="100%" h="100%" ref={refMapContainer}></Box>
        </AspectRatio>
      </Box>
      <Box>
        <Text fontSize="md" mb="0.2" fontWeight="normal">
          {t("form.geolocation.lat.label", "Latitude")}
          <br />
        </Text>

        <Text>{lat}</Text>

        <Text fontSize="md" mb="0.2" fontWeight="normal">
          {t("form.geolocation.lng.label", "Longitude")}
        </Text>

        <Text>{lng}</Text>
      </Box>
    </Grid>
  );
};
