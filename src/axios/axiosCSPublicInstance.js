import axios from "axios";

let axiosCSPublicInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosCSPublicInstance;
