import axios from "axios";
import { PointLessRequest, PointLessResponse } from "@pointless/types";
import { useAuth0 } from "@auth0/auth0-react";

const api = axios.create({
  baseURL: process.env.VITE_API_URL || "",
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { getAccessTokenSilently } = useAuth0();
  try {
    const token = await getAccessTokenSilently();
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error("Error getting access token:", error);
  }
  return config;
});

export const pointStory = async (
  request: PointLessRequest
): Promise<PointLessResponse> => {
  const response = await api.post("/.netlify/functions/point", request);
  return response.data;
};
