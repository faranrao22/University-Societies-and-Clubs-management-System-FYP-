// frontend/src/config/api.config.js

// Backend API base URL
// You can switch between local and production easily
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export default API_BASE_URL;
