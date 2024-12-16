import axios from "axios";

// Create an instance of Axios
const axiosApi = axios.create({
  baseURL: "https://notes.devlop.tech/api", // Base URL for all requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in every request
axiosApi.interceptors.request.use(
  (data) => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    if (token) {
      data.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    }
    return data; // Return modified data
  },
  (error) => {
    console.error("Request error:", error.message);
    return Promise.reject(error); // Reject the request
  }
);

// Add a response interceptor for error handling
axiosApi.interceptors.response.use(
  (response) => response.data, // Pass successful response data
  (error) => {
    if (error.response) {
      console.error(
        `Error: ${error.response.status} - ${error.response.data.message || "Unknown error"}`
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error); // Reject the response
  }
);

export default axiosApi;
