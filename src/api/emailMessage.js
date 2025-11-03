import axios from "./http";

/**
 * List all email message templates for the current business account.
 */
export const listEmailMessages = async () => {
  const { data } = await axios.get("/api/email-messages");
  return data.data;
};

/**
 * Get a specific email message template by ID.
 */
export const getEmailMessage = async (id) => {
  const { data } = await axios.get(`/api/email-messages/${id}`);
  return data.data;
};

/**
 * Update an email message template (subject/body/status/logo_url).
 */
export const updateEmailMessage = async (id, payload) => {
  const { data } = await axios.put(`/api/email-messages/${id}`, payload);
  return data.data;
};
