declare const process: any;

export const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) || "http://localhost:8000";

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};