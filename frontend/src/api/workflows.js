import { api } from "./client";

export const workflowsApi = {
  list: () => api.get("/api/workflows"),
  get: (ticketType) => api.get(`/api/workflows/${ticketType}`),
  update: (ticketType, data) => api.put(`/api/workflows/${ticketType}`, data),
};
