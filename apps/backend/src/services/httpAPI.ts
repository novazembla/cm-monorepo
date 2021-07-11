import { applyAuthTokenInterceptor } from 'axios-jwt';
import axios from 'axios';

const httpAPI = axios.create({ baseURL: process.env.REACT_APP_API_BASE_URL })

const requestRefresh = async (refreshToken: string) => {
  
  // Notice that this is the global axios instance, not the axiosInstance!  <-- important
  const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/refresh-tokens`, { token: refreshToken })

  // TODO: does the refresh work? 
  return {
   accessToken: response.data?.access_token ?? null,
   refreshToken: response.data?.refresh_token ?? null
  }
};

applyAuthTokenInterceptor(httpAPI, { requestRefresh });  // Notice that this uses the axiosInstance instance.  <-- important


export default httpAPI;