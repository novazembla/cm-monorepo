import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Grid, Box, AspectRatio, Button, Flex } from "@chakra-ui/react";
import { geocodeQueryGQL } from "@culturemap/core";

import L from "leaflet";
import "maplibre-gl";
import "@maplibre/maplibre-gl-leaflet";
import "leaflet/dist/leaflet.css";

import {
  FieldRow,
  FieldNumberInput,
  FieldAutocomplete,
  FieldAutocompleteItem,
} from ".";

import type { GeoLocation } from "~/types";
import { useConfig, useSettings } from "~/hooks";
import { useFormContext } from "react-hook-form";

import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
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
        center: [
          (mapBounds[0].lat + mapBounds[1].lat) / 2,
          (mapBounds[0].lng + mapBounds[1].lng) / 2,
        ],
        zoom,
        minZoom: 11,
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      L.maplibreGL({
        style,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">Openstreet Map Contributors</a>',
      }).addTo(this.map);

      this.pin = undefined;

      this.map.on("click", (e: L.LeafletMouseEvent) => {
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

const distance = (p1: GeoLocation, p2: GeoLocation) => {
  const R = 3958.8; // Radius of the Earth in miles
  const rlat1 = p1.lat * (Math.PI / 180); // Convert degrees to radians
  const rlat2 = p2.lat * (Math.PI / 180); // Convert degrees to radians
  const difflat = rlat2 - rlat1; // Radian difference (latitudes)
  const difflon = (p2.lng - p1.lng) * (Math.PI / 180); // Radian difference (longitudes)

  const d =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) +
          Math.cos(rlat1) *
            Math.cos(rlat2) *
            Math.sin(difflon / 2) *
            Math.sin(difflon / 2)
      )
    );
  return d;
};

export const LocationPicker = ({
  lat,
  lng,
  required,
  fieldNameLat = "lat",
  fieldNameLng = "lng",
  alternativeLocations,
  clearAlternatives,
}: {
  lat: number;
  lng: number;
  required: boolean;
  fieldNameLat?: string;
  fieldNameLng?: string;
  alternativeLocations?: any[];
  clearAlternatives?: () => void;
}) => {
  const settings = useSettings();
  const { t } = useTranslation();
  const config = useConfig();

  const refMapContainer = useRef<HTMLDivElement>(null);
  const refMap = useRef<LeafletLocationPicker>();

  const [hideAlternatives, setHideAlternatives] = useState(false);
  const [shouldSetIsDirty, setShouldSetIsDirty] = useState(false);
  const [point, setPoint] = useState<GeoLocation>({
    lat,
    lng,
  });

  const [initialState, setInitialState] = useState<GeoLocation>();

  const { setValue } = useFormContext();

  const setNewPoint = useCallback(
    (point: GeoLocation) => {
      if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) return;

      setPoint(point);
    },

    [setPoint] //, setValue, fieldNameLat, fieldNameLng]
  );

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
        (p) => {
          setShouldSetIsDirty(true);
          setNewPoint(p);
        },
        config.mapOuterBounds,
        13,
        config.mapStyleUrl
      );

    if (
      !Number.isNaN(point.lat) &&
      !Number.isNaN(point.lng) &&
      point.lat &&
      point.lng
    ) {
      refMap.current.setPoint(point);
    }

    if (!initialState) {
      setInitialState(point);
      setNewPoint(point);
    }

    setValue(fieldNameLat, point.lat, {
      shouldDirty: shouldSetIsDirty,
    });

    setValue(fieldNameLng, point.lng, {
      shouldDirty: shouldSetIsDirty,
    });
  }, [
    point,
    shouldSetIsDirty,
    setInitialState,
    initialState,
    config.mapOuterBounds,
    config.mapStyleUrl,
    setNewPoint,
    fieldNameLat,
    fieldNameLng,
    setValue,
  ]);

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

  const centerOfGravity = settings.centerOfGravity ?? {
    lng: (bounds[0][1] + bounds[1][1]) / 2,
    lat: (bounds[0][0] + bounds[1][0]) / 2,
  };

  const isButtonDisabled =
    point.lat === initialState?.lat && point.lng === initialState?.lng;

  return (
    <Box>
      <Box pb="4">
        <FieldRow>
          <FieldAutocomplete
            name="searchLocation"
            id="searchLocation"
            label={t("forms.field.label.locationPickerSearch", "Search")}
            searchQueryGQL={geocodeQueryGQL}
            createSearchVariables={(value) => ({
              q: value,
            })}
            processSearchResult={(data) => {
              if (
                data &&
                data?.geocode &&
                data?.geocode?.geojson &&
                data?.geocode?.count > 0 &&
                Array.isArray(data?.geocode?.geojson?.features)
              ) {
                const result = data.geocode.geojson.features.reduce(
                  (agg: any, item: any) => {
                    if (
                      item?.geometry?.coordinates &&
                      item?.geometry?.type === "Point" &&
                      // lng
                      item?.geometry?.coordinates[0] >= bounds[0][1] &&
                      item?.geometry?.coordinates[0] <= bounds[1][1] &&
                      // lat
                      item?.geometry?.coordinates[1] >= bounds[0][0] &&
                      item?.geometry?.coordinates[1] <= bounds[1][0]
                    ) {
                      agg.push({
                        lng: item?.geometry?.coordinates[0],
                        lat: item?.geometry?.coordinates[1],
                        title: item?.properties?.title,
                        distance: distance(
                          {
                            lng: item?.geometry?.coordinates[0],
                            lat: item?.geometry?.coordinates[1],
                          },
                          centerOfGravity
                        ),
                      });
                    }
                    return agg;
                  },

                  []
                );

                if (result.length > 1) {
                  result.sort(
                    (
                      item: FieldAutocompleteItem,
                      item2: FieldAutocompleteItem
                    ) => {
                      if (item.distance < item2.distance) {
                        return -1;
                      }
                      if (item2.distance > item.distance) {
                        return 1;
                      }
                      return 0;
                    }
                  );
                }

                return result;
              }
              return [];
            }}
            onItemSelect={(item: any) => {
              setNewPoint({
                lat: parseFloat(
                  typeof item.lat === "string" ? item.lat : item.lat.toFixed(8)
                ),
                lng: parseFloat(
                  typeof item.lng === "string" ? item.lng : item.lng.toFixed(8)
                ),
              });
            }}
            resultItemToString={(item: any) => item.title}
            settings={{
              debounceInterval: 1000,
              minimumLength: 5,
              placeholder: t(
                "forms.field.placeholder.locationPickerSearch",
                "Please enter an address to search"
              ),
            }}
          />
        </FieldRow>
      </Box>
      <Grid
        w="100%"
        templateColumns={{ base: "100%", t: "2fr 1fr" }}
        templateRows={{ base: "auto 1fr", t: "auto" }}
        gap={{ base: "4", s: "6" }}
      >
        <Box>
          <AspectRatio
            ratio={16 / 9}
            border="1px solid"
            borderColor="gray.400"
            borderRadius="md"
          >
            <Box w="100%" h="100%" ref={refMapContainer}></Box>
          </AspectRatio>
        </Box>
        <Box>
          <FieldRow>
            <FieldNumberInput
              name={fieldNameLat}
              id={fieldNameLat}
              label={t("form.geolocation.lat.label", "Latitude")}
              isRequired={required}
              settings={{
                precision: 8,
                step: 0.01,
                onChange: (value: number) => {
                  if (value) {
                    setShouldSetIsDirty(true);
                    setNewPoint({
                      lat: parseFloat(
                        typeof value === "string" ? value : value.toFixed(8)
                      ),
                      lng: point.lng,
                    });
                  }
                },
                value: point.lat,
                defaultValue: lat,
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldNumberInput
              name={fieldNameLng}
              id={fieldNameLng}
              label={t("form.geolocation.lng.label", "Longitude")}
              isRequired={required}
              settings={{
                precision: 8,
                step: 0.01,
                onChange: (value: number) => {
                  if (value) {
                    setShouldSetIsDirty(true);
                    setNewPoint({
                      lat: point.lat,
                      lng: parseFloat(
                        typeof value === "string" ? value : value.toFixed(8)
                      ),
                    });
                  }
                },
                value: point.lng,
                defaultValue: lng,
              }}
            />
          </FieldRow>
          <FieldRow>
            <Button
              onClick={() => {
                if (initialState) setNewPoint(initialState);
              }}
              isDisabled={isButtonDisabled}
              colorScheme={!isButtonDisabled ? "wine" : "gray"}
            >
              {t("form.geolocation.button.reset", "Reset")}
            </Button>
          </FieldRow>
        </Box>
      </Grid>
      {Array.isArray(alternativeLocations) && alternativeLocations.length > 1 && !hideAlternatives && (
        <FieldRow>
          <Box w="100%">
            <Box maxW="900px">
              {t(
                "form.geolocation.alternatives.info",
                "During import the geocoding retrieved more than one location candidate. While the closest to the configured 'center of gravity' has been used. You can select an alternative here."
              )}
            </Box>

            <Box mt="4" borderTop="1px solid" borderColor="gray.200" w="100%">
              {alternativeLocations.map((feature, index) => {
                return (
                  <Box key={`alternative-${index}`} w="100%">
                    {feature?.geometry?.type === "Point" &&
                      feature?.properties?.distance && (
                        <Flex
                          borderBottom="1px solid"
                          borderColor="gray.200"
                          pb="2"
                          pt="2"
                          w="100%"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box pr="2">
                            {feature?.properties?.title}
                            <br />
                            {t(
                              "form.geolocation.alternatives.distance",
                              "Distance"
                            )}
                            : {feature?.properties?.distance.toFixed(2)}
                            km
                          </Box>
                          <Button
                            onClick={() =>
                              setNewPoint({
                                lng: feature?.geometry?.coordinates[0],
                                lat: feature?.geometry?.coordinates[1],
                              })
                            }
                            isDisabled={
                              point.lng === feature?.geometry?.coordinates[0] &&
                              point.lat === feature?.geometry?.coordinates[1]
                            }
                            px="2"
                          >
                            {t(
                              "form.geolocation.alternatives.useAddress",
                              "Use address"
                            )}
                          </Button>
                        </Flex>
                      )}
                  </Box>
                );
              })}
            </Box>
            {clearAlternatives && (
              <Box mt="4">
                <Button onClick={() => {
                  setHideAlternatives(true);
                  clearAlternatives();
                }} px="2">
                  {t(
                    "form.geolocation.alternatives.clearAlternatives",
                    "Accept choice and remove alternatives"
                  )}
                </Button>
              </Box>
            )}
          </Box>
        </FieldRow>
      )}
    </Box>
  );
};
