import { Api } from "../generated/backendApi";

export const api = new Api({
  baseUrl: process.env.REACT_APP_API_URL || "http://localhost:3000",
  baseApiParams: {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  },
});
