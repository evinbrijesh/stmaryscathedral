// src/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL + "/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API_BASE;

export const getMembers = () => api.get("/members");
export const createMember = (memberData) => api.post("/members", memberData);
export const updateMember = (id, data) => api.put(`/members/${id}`, data);
export const deleteMember = (id) => api.delete(`/members/${id}`);

export const getFamilies = () => api.get("/families");
export const createFamily = (data) => api.post("/families", data);
