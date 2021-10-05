import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import { GeoLocation, Address } from "../../types";

import { geocodingGetCenterOfGravity } from ".";
import logger from "../../services/serviceLogging";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export class GeoCoderKomoot {
  async query(address: Address, point?: GeoLocation) {
    const centerOfGravity = point ?? (await geocodingGetCenterOfGravity());

    const client = axios.create({ baseURL: "https://photon.komoot.io/api/" });
    axiosRetry(client, { retries: 3 });

    let result = { features: [], type: "FeatureCollection" };
    const query = [];

    if (address.city && address.city.trim() !== "")
      query.push(address.city.trim());

    if (address.street && address.street.trim() !== "")
      query.push(address.street.trim());

    if (address.street2 && address.street2.trim() !== "")
      query.push(address.street2.trim());

    if (address.street3 && address.street3.trim() !== "")
      query.push(address.street3.trim());

    if (address.postcode && address.postcode.trim() !== "")
      query.push(address.postcode.trim());

    if (address.country && address.country.trim() !== "")
      query.push(address.country.trim());

    let latLon = "";
    if (centerOfGravity)
      latLon = `&lat=${centerOfGravity.lat}&lng=${centerOfGravity.lng}`;

    try {
      await client
        .get(`?q=${query.join(", ")}${latLon}`, {
          headers: { "User-Agent": "CultureMap 1.0" },
        })
        .then((response: AxiosResponse<any>) => {
          if (response.data) result = response.data;
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
