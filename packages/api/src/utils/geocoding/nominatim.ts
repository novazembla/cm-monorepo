import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

import { Address } from "../../types";
import logger from "../../services/serviceLogging";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// https://nominatim.org/release-docs/develop/api/Search/

export class GeoCoderNominatim {
  async query(address: Address, type: string = "autocomplete") {
    const client = axios.create({
      baseURL: "https://nominatim.openstreetmap.org/",
    });
    axiosRetry(client, { retries: 3 });

    let result = { features: [], type: "FeatureCollection" } as any;
    if (!address) return result;

    const queryParams: any = {};
    if (type === "autocomplete") {
      if (address.street1 && address.street1.trim() !== "")
        queryParams.q = `${address.street1.trim()} berlin germany`;
    } else {
      let street = "";
      let houseNumber = "";

      if (address.houseNumber && address.houseNumber.trim() !== "") {
        houseNumber = `${encodeURIComponent(address.houseNumber.trim())}`;
      }

      if (address.street1 && address.street1.trim() !== "") {
        street = `${encodeURIComponent(address.street1.trim())}`;
      }

      if (address.street2 && address.street2.trim() !== "") {
        street = `${street}${
          street.length > 0 ? ", " : ""
        } ${encodeURIComponent(address.street2.trim())}`;
      }

      if (street.length > 0) {
        queryParams.street = `${houseNumber}${
          houseNumber.length > 0 ? " " : ""
        }${street}`;
      }

      if (address.postCode && address.postCode.trim() !== "") {
        queryParams.postalCode = address.postCode.trim();
      }

      if (address.city && address.city.trim() !== "") {
        queryParams.city = address.city.trim();
      }

      if (address.state && address.state.trim() !== "") {
        queryParams.state = address.state.trim();
      }

      if (address.country && address.country.trim() !== "") {
        queryParams.country = address.country.trim();
      }
    }

    try {
      await client
        .get(`search`, {
          headers: { "User-Agent": "CultureMap 1.0" },
          params: {
            ...queryParams,
            format: "geojson",
            limit: 10,
          },
        })
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
          logger.error(err);
          throw err;
        });
      return result;
    } catch (err: any) {
      if (err.response) {
        const status = parseInt(err.response.status);

        if (status >= 400) logger.warn(err.error);
      }

      logger.debug(err?.error);
    }

    return { features: [], type: "FeatureCollection" };
  }
}
