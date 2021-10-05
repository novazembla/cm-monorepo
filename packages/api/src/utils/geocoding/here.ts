import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import { safeGuardVariable } from "@culturemap/core";

import { Address } from "../../types";
import logger from "../../services/serviceLogging";
import { getApiConfig } from "../../config";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

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

    let result = { features: [], type: "FeatureCollection" };

    let query = "";
    if (type === "autocomplete") {
      if (address.street && address.street.trim() !== "")
        query = `q=${address.street.trim()}`;
    } else {
      // const queryParams = [];
    }

    console.log(
      `geocode?${query}&limit=10&in=countryCode:${apiConfig.geoCodingRegions.join(
        ","
      )}&apiKey=${apiKey}`
    );

    // if (address.city && address.city.trim() !== "")
    //   query.push(address.city.trim());

    // if (address.street2 && address.street2.trim() !== "")
    //   query.push(address.street2.trim());

    // if (address.street3 && address.street3.trim() !== "")
    //   query.push(address.street3.trim());

    // if (address.postcode && address.postcode.trim() !== "")
    //   query.push(address.postcode.trim());

    // if (address.country && address.country.trim() !== "")
    //   query.push(address.country.trim());

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
            if (response.data) result = response.data;
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
    };
  }
}
