import { api } from "./client";

export const ticketsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && qs.set(k, v));
    return api.get(`/api/tickets?${qs}`);
  },
  get: (id) => api.get(`/api/tickets/${id}`),
  create: (data) => api.post("/api/tickets", data),
  update: (id, data) => api.patch(`/api/tickets/${id}`, data),
  delete: (id) => api.delete(`/api/tickets/${id}`),
  addComment: (id, body, isInternal = false) =>
    api.post(`/api/tickets/${id}/comments`, { body, is_internal: isInternal }),
  updateFields: (id, fields) =>
    api.put(`/api/tickets/${id}/fields`, { fields }),
};
