import http from "@/api/http";

// ⭐ Allow an optional account_id parameter
export async function getBusinessSetting(type, accountId = null) {
  try {
    const headers = {};

    // ⭐ Pass account ID when used on public pages
    if (accountId) {
      headers["X-Account-Id"] = accountId;
    }

    const { data } = await http.get(`/api/business/settings/${type}`, {
      headers,
      params: accountId ? { account_id: accountId } : {},
    });

    return data?.data || {};
  } catch (err) {
    console.error("Error fetching business setting:", err);
    return {};
  }
}

// ----------------------------------------------
// UPDATE BUSINESS SETTING (Admin Panel Only)
// ----------------------------------------------
export async function updateBusinessSetting(type, payload, isMultipart = false) {
  try {
    const config = isMultipart
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};

    const { data } = await http.post(
      `/api/business/settings/${type}`,
      payload,
      config
    );

    return data?.data || {};
  } catch (err) {
    console.error("Error updating business setting:", err);
    throw err;
  }
}
