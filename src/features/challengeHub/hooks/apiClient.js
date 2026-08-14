// hooks/apiClient.js

import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const fetcher = async (url) => {
  const { data } = await apiClient.get(url);
  return data;
};