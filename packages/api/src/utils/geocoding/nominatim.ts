import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

import { Address } from "../../types";
import logger from "../../services/serviceLogging";
import { getApiConfig } from "../../config";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// https://nominatim.org/release-docs/develop/api/Search/

export class GeoCoderNominatim {
  async query(address: Address, type: string = "autocomplete") {
    const apiConfig = getApiConfig();

    const client = axios.create({
      baseURL: "https://nominatim.openstreetmap.org/",
    });
    axiosRetry(client, { retries: 3 });

    let result = { features: [], type: "FeatureCollection" } as any;

    let query = "";
    if (type === "autocomplete") {
      if (address.street1 && address.street1.trim() !== "")
        query = `q=${address.street1.trim()}`;
    } else {
      const queryParams = [];
      let street = "";
      let houseNumber = "";

      if (address.houseNumber && address.houseNumber.trim() !== "")
        houseNumber = `${encodeURIComponent(address.houseNumber.trim())}`;

      if (address.street1 && address.street1.trim() !== "")
        street = `${encodeURIComponent(address.street1.trim())}`;

      if (address.street2 && address.street2.trim() !== "")
        street = `${street}${
          street.length > 0 ? ", " : ""
        } ${encodeURIComponent(address.street2.trim())}`;

      if (street.length > 0)
        queryParams.push(
          `street=${houseNumber}${houseNumber.length > 0 ? " " : ""}${street}`
        );

      if (address.postCode && address.postCode.trim() !== "")
        queryParams.push(
          `postalCode=${encodeURIComponent(address.postCode.trim())}`
        );

      if (address.city && address.city.trim() !== "")
        queryParams.push(`city=${encodeURIComponent(address.city.trim())}`);

      if (address.state && address.state.trim() !== "")
        queryParams.push(`state=${encodeURIComponent(address.state.trim())}`);

      if (address.country && address.country.trim() !== "")
        queryParams.push(
          `country=${encodeURIComponent(address.country.trim())}`
        );

      query = `qq=${queryParams.join("&")}`;
    }

    try {
      if (query !== "") {
        await client
          .get(
            `search?${query}&format=geojson&limit=10&countrycodes=${apiConfig.geoCodingRegions.join(
              ","
            )}`,
            {
              headers: { "User-Agent": "CultureMap 1.0" },
            }
          )
          .then((response: AxiosResponse<any>) => {
            if (response.data) {
              result = response.data;

              if (result.features && Array.isArray(result.features))
                result.features = result.features.map((feature: any) => {
                  return {
                    ...feature,
                    properties: {
                      ...feature.properties,
                      title: feature.properties.display_name,
                    },
                  };
                });
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

    return { features: [], type: "FeatureCollection" };
  }
}
