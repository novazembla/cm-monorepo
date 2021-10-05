import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import { safeGuardVariable } from "@culturemap/core";

import { Address } from "../../types";
import logger from "../../services/serviceLogging";
import { getApiConfig } from "../../config";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// Docs: https://developer.here.com/documentation/geocoding-search-api/dev_guide/topics/endpoint-geocode-brief.html
// resultTypes: place, locality, street, houseNumber, administrativeArea, addressBlock, intersection, postalCodePoint, chainQuery, categoryQuery.

export class GeoCoderHere {
  async query(address: Address, type: string = "autocomplete") {
    const apiConfig = getApiConfig();
    const apiKey = safeGuardVariable(
      logger,
      "string",
      process.env.HERE_API_KEY,
      "",
      "Error: missing/wrong .env config: HERE_API_KEY"
    );

    const client = axios.create({
      baseURL: "https://geocode.search.hereapi.com/v1/",
    });
    axiosRetry(client, { retries: 3 });

    let result = { features: [], type: "FeatureCollection" } as any;

    let query = "";
    if (type === "autocomplete") {
      if (address.street && address.street.trim() !== "")
        query = `q=${address.street.trim()}`;
    } else {
      const queryParams = [];
      const streetParts = [];

      if (address.street && address.street.trim() !== "")
        streetParts.push(address.street.trim());

      if (address.street2 && address.street2.trim() !== "")
        streetParts.push(address.street2.trim());

      if (address.street3 && address.street3.trim() !== "")
        streetParts.push(address.street3.trim());

      if (streetParts.length > 0)
        queryParams.push(`street=${streetParts.join(", ")}`);

      if (address.houseNumber && address.houseNumber.trim() !== "")
        queryParams.push(`houseNumber=${address.houseNumber.trim()}`);

      if (address.postcode && address.postcode.trim() !== "")
        queryParams.push(`postalCode=${address.postcode.trim()}`);

      if (address.city && address.city.trim() !== "")
        queryParams.push(`city=${address.city.trim()}`);

      if (address.state && address.state.trim() !== "")
        queryParams.push(`state=${address.state.trim()}`);

      if (address.country && address.country.trim() !== "")
        queryParams.push(`country=${address.country.trim()}`);

      query = `qq=${queryParams.join(";")}`;
    }

    try {
      if (query !== "") {
        await client
          .get(
            `geocode?${query}&limit=10&in=countryCode:${apiConfig.geoCodingRegions.join(
              ","
            )}&apiKey=${apiKey}`,
            {
              headers: { "User-Agent": "CultureMap 1.0" },
            }
          )
          .then((response: AxiosResponse<any>) => {
            if (
              response.data &&
              response?.data?.items &&
              Array.isArray(response?.data?.items)
            ) {
              result.features = response.data.items.map((item: any) => ({
                type: "Feature",
                geometry: {
                  coordinates: [
                    item?.position?.lng ?? 0.0,
                    item?.position?.lat ?? 0.0,
                  ],
                  type: "Point",
                },
                properties: {
                  ...item.address,
                  title: item.title,
                  resultType: item.resultType,
                  houseNumberType: item.houseNumberType,
                },
              }));
              result.count = result.features.length;
            }
          })
          .catch((err) => {
            throw err;
          });
        return result;
      }
    } catch (err: any) {
      if (err.response) {
        const status = parseInt(err.response.stauts);

        if (status >= 400) logger.error(err);
      }

      logger.debug(err);
    }

    return {
      geojson: { features: [], type: "FeatureCollection" },
      count: 0,
    } as any;
  }
}
