import http from "@/api/http";

/** List items (optionally filter completed) */
export const listTodos = (completed = null) =>
  http.get("/api/business/todo", { params: completed === null ? {} : { completed }});

/** Create a new item */
export const createTodo = (payload) =>
  http.post("/api/business/todo", payload);

/** Update an item */
export const updateTodo = (id, payload) =>
  http.put(`/api/business/todo/${id}`, payload);

/** Delete an item */
export const deleteTodo = (id) =>
  http.delete(`/api/business/todo/${id}`);

/** Toggle completion */
export const toggleTodo = (id) =>
  http.patch(`/api/business/todo/${id}/toggle`);
