import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Grid, Box, AspectRatio } from "@chakra-ui/react";

import L from "leaflet";
import "maplibre-gl";
import "@maplibre/maplibre-gl-leaflet";
import "leaflet/dist/leaflet.css";

import { FieldInput, FieldRow } from ".";

import type { GeoLocation } from "~/types";
import { useConfig } from "~/hooks";
import { useFormContext } from "react-hook-form";

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

class LeafletLocationPicker {
  pin: L.Marker | undefined;
  map: L.Map | undefined;

  storePoint: (geolocation: GeoLocation) => void;

  constructor(
    refContainer: React.RefObject<HTMLDivElement>,
    storePoint: (geolocation: GeoLocation) => void,
    mapBounds: [GeoLocation, GeoLocation],
    zoom: number,
    style: string
  ) {
    this.storePoint = storePoint;

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

      this.map.on("click", (e: L.LeafletMouseEvent) => {
        console.log(e);
        this.setPoint(e.latlng);
        this.storePoint(e.latlng);
      });
    } else {
      throw Error("LeafLetMapGeopMan MapContainer Ref not set");
    }
  }

  setPoint(geolocation: GeoLocation) {
    if (!this.map) return;

    if (!this.pin) {
      this.pin = L.marker(L.latLng(geolocation.lat, geolocation.lng), {
        draggable: true,
      }).addTo(this.map);

      this.pin.on("dragend", (event) => {
        if (!this.map) return;

        const marker = event.target;
        const position = marker.getLatLng();
        marker.setLatLng(new L.LatLng(position.lat, position.lng));
        this.map.panTo(new L.LatLng(position.lat, position.lng));
        this.storePoint(position);
      });
    } else {
      this.pin.setLatLng(new L.LatLng(geolocation.lat, geolocation.lng));
    }
    this.map.panTo(new L.LatLng(geolocation.lat, geolocation.lng));
  }
}

export const LocationPicker = ({
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
  const refMap = useRef<LeafletLocationPicker>();

  const [point, setPoint] = useState({
    lat,
    lng,
  });

  const { setValue } = useFormContext();

  useEffect(() => {
    if (
      !window ||
      !refMapContainer.current ||
      !config.mapOuterBounds ||
      !config.mapStyleUrl
    )
      return;

    if (!refMap.current)
      refMap.current = new LeafletLocationPicker(
        refMapContainer,
        (point: GeoLocation) => {
          setPoint(point);
          setValue(fieldNameLat, point.lat, {
            shouldDirty: true,
          });
          setValue(fieldNameLng, point.lng, {
            shouldDirty: true,
          });
        },
        config.mapOuterBounds,
        13,
        config.mapStyleUrl
      );

    refMap.current.setPoint(point);
  }, [
    point,
    config.mapOuterBounds,
    config.mapStyleUrl,
    setValue,
    fieldNameLat,
    fieldNameLng,
  ]);

  return (
    <Grid
      w="100%"
      templateColumns={{ base: "100%", t: "2fr 1fr" }}
      templateRows={{ base: "auto 1fr", t: "auto" }}
      gap={{ base: "4", s: "6" }}
    >
      <Box>
        <AspectRatio ratio={16 / 9}>
          <Box w="100%" h="100%" ref={refMapContainer}></Box>
        </AspectRatio>
      </Box>
      <Box>
        <FieldRow>
          <FieldInput
            name={fieldNameLat}
            id={fieldNameLat}
            type="text"
            label={t("form.geolocation.lat.label", "Latitude")}
            isRequired={required}
            settings={{
              defaultValue: lat,
            }}
          />
        </FieldRow>
        <FieldRow>
          <FieldInput
            name={fieldNameLng}
            id={fieldNameLng}
            type="text"
            label={t("form.geolocation.lng.label", "Longitude")}
            isRequired={required}
            settings={{
              defaultValue: lng,
            }}
          />
        </FieldRow>
      </Box>
    </Grid>
  );
};
