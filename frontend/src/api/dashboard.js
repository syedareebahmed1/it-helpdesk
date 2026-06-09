import { api } from "./client";

export const dashboardApi = {
  stats: () => api.get("/api/dashboard/stats"),
  formFields: (ticketType) => api.get(`/api/dashboard/form-fields/${ticketType}`),
  ticketTypes: () => api.get("/api/dashboard/ticket-types"),
};
