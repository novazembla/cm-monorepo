import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import { GeoLocation, Address } from "../../types";

import pkg from "lodash";

import { geocodingGetCenterOfGravity } from ".";
import logger from "../../services/serviceLogging";
const { pick } = pkg;
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// https://photon.komoot.io/

export class GeoCoderKomoot {
  async query(address: Address, point?: GeoLocation) {
    const centerOfGravity = point ?? (await geocodingGetCenterOfGravity());

    const client = axios.create({ baseURL: "https://photon.komoot.io/api/" });
    axiosRetry(client, { retries: 3 });

    let result = { features: [], type: "FeatureCollection" } as any;
    const query = [];

    if (address.city && address.city.trim() !== "")
      query.push(encodeURIComponent(address.city.trim()));

    if (address.street1 && address.street1.trim() !== "")
      query.push(encodeURIComponent(address.street1.trim()));

    if (address.street2 && address.street2.trim() !== "")
      query.push(encodeURIComponent(address.street2.trim()));

    if (address.postCode && address.postCode.trim() !== "")
      query.push(encodeURIComponent(address.postCode.trim()));

    if (address.country && address.country.trim() !== "")
      query.push(encodeURIComponent(address.country.trim()));

    let latLon = "";
    if (centerOfGravity)
      latLon = `&lat=${centerOfGravity.lat}&lng=${centerOfGravity.lng}`;

    try {
      await client
        .get(`?q=${query.join(", ")}${latLon}`, {
          headers: { "User-Agent": "CultureMap 1.0" },
        })
        .then((response: AxiosResponse<any>) => {
          if (response.data) {
            result = response.data;

            if (result.features && Array.isArray(result.features))
              result.features = result.features.map((feature: any) => {
                const titleAttr = pick(feature.properties, [
                  "name",
                  "street",
                  "housenumber",
                  "postcode",
                  "city",
                  "country",
                ]) as any;

                const title = Object.keys(titleAttr)
                  .map((key: any) => titleAttr[key])
                  .join(", ");
                return {
                  ...feature,
                  properties: {
                    ...feature.properties,
                    title,
                  },
                };
              });
          }
        })
        .catch((err) => {
          throw err;
        });
    } catch (err: any) {
      if (err.response) {
        const status = parseInt(err.response.stauts);

        if (status >= 400) logger.error(err);

        // } else if (err.request) {
        //   // The request was made but no response was received
        //   console.log(error.request);
        // } else {
        //   // Something happened in setting up the request that triggered an Error
        //   console.log("Error", error.message);
      }

      logger.debug(err);
    }

    return result;
  }
}
