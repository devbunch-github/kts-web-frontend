// src/api/common.js
import axios from "./http";

export async function uploadGeneric(file, type = "employees") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const { data } = await axios.post("/api/file-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data; // { path, url }
}
