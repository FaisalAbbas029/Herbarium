// This file is the single place in the app that talks to our Express
// backend (see server.js). Every page and component should call these
// functions instead of using fetch() directly, so the auth token and
// error handling stay consistent everywhere.
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_BASE = API_BASE_URL
  ? API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`
  : "/api";

// After a successful login the backend gives us a session token (see
// server/auth.js). We keep that token in localStorage so the admin stays
// logged in after a page refresh, and attach it to every request below.
function getAuthHeader() {
  const token = localStorage.getItem("sylva_herbarium_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJsonResponse(response, url) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  const preview = text && text.length > 300 ? `${text.slice(0, 300)}...` : text;

  if (!text) {
    return {};
  }

  try {
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("API response was not valid JSON", {
      url,
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodyPreview: preview
    });
    throw new Error(`Server returned a non-JSON response for ${url}. Check the backend URL and response format.`);
  }
}

// Shared helper used by almost every function in this file.
// It automatically adds the auth token, sends/receives JSON, and turns
// any error response from the server into a JavaScript Error so pages can
// catch it with a normal try/catch and show a friendly message.
async function request(url, options = {}) {
  const fullUrl = `${API_BASE}${url}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers
  });

  let data;
  try {
    data = await parseJsonResponse(response, fullUrl);
  } catch (error) {
    if (!response.ok) {
      throw error;
    }
    throw error;
  }

  if (!response.ok) {
    console.error("API request failed", {
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      responseBody: data
    });
    throw new Error(data?.error || `Request failed with ${response.status} ${response.statusText}.`);
  }

  return data;
}
const api = {
  // Auth
  async login(credentials) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    localStorage.setItem("sylva_herbarium_token", res.token);
    return res;
  },
  async getCurrentUser() {
    return request("/auth/me");
  },
  async logout() {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("sylva_herbarium_token");
    }
  },
  // Team
  async getTeam() {
    return request("/team");
  },
  async inviteColleague(data) {
    return request("/team/invite", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async toggleUserStatus(userId, status) {
    return request("/team/toggle-status", {
      method: "POST",
      body: JSON.stringify({ userId, status })
    });
  },
  async revokeInvitation(invitationId) {
    return request(`/team/invitations/${invitationId}`, {
      method: "DELETE"
    });
  },
  async getInvitationByToken(token) {
    return request(`/team/invitation/${token}`);
  },
  async acceptInvitation(data) {
    const res = await request("/team/accept-invitation", {
      method: "POST",
      body: JSON.stringify(data)
    });
    localStorage.setItem("sylva_herbarium_token", res.token);
    return res;
  },
  // Specimens
  async searchSpecimens(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== void 0 && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    return request(`/specimens?${query.toString()}`);
  },
  async getSuggestions(q) {
    return request(
      `/specimens/suggestions?q=${encodeURIComponent(q)}`
    );
  },
  async getSpecimen(id) {
    return request(`/specimens/${id}`);
  },
  async getRelatedSpecimens(id) {
    return request(`/specimens/${id}/related`);
  },
  async checkAccessionExists(accession, excludeId) {
    const query = excludeId ? `?excludeId=${encodeURIComponent(excludeId)}` : "";
    return request(`/specimens/check-accession/${encodeURIComponent(accession)}${query}`);
  },
  async createSpecimen(data) {
    return request("/specimens", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async updateSpecimen(id, updates) {
    return request(`/specimens/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
  },
  async deleteSpecimen(id) {
    return request(`/specimens/${id}`, {
      method: "DELETE"
    });
  },
  async bulkUpdateStatus(ids, status) {
    return request("/specimens/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids, status })
    });
  },
  async bulkDeleteSpecimens(ids) {
    return request("/specimens/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids })
    });
  },
  // Photos
  //
  // SPECIMEN PHOTO UPLOAD & PATH — how it works end to end:
  // 1. uploadPhotoFile() below sends the raw image file to
  //    POST /api/photos/upload using multipart/form-data (we can't use our
  //    normal JSON request() helper here because file uploads need
  //    FormData, not JSON).
  // 2. On the server (server.js), Multer saves the file to the /uploads
  //    folder on disk with a unique generated name, e.g.
  //    "specimen-1699999999999-a1b2c3.jpg".
  // 3. The server responds with a "storageUrl" such as
  //    "/uploads/specimen-1699999999999-a1b2c3.jpg". That string is the
  //    "specimen path" — it's just a normal URL path, and because the
  //    /uploads folder is served statically by Express
  //    (app.use('/uploads', express.static(UPLOADS_DIR))), the browser can
  //    load the image directly from that path.
  // 4. addPhoto() then saves that storageUrl onto the specimen record
  //    (server/db.js), so it is remembered permanently and shown again the
  //    next time the specimen is viewed.
  //
  // In production, replace the local /uploads folder with a real file
  // storage service (e.g. Amazon S3, Cloudinary, or Google Cloud Storage)
  // — you would only need to change the upload handler in server.js; this
  // frontend code would not need to change at all, since it only cares
  // about the final storageUrl string.
  async uploadPhotoFile(file) {
    const formData = new FormData();
    formData.append("photo", file);
    const token = localStorage.getItem("sylva_herbarium_token");
    const response = await fetch(`${API_BASE}/photos/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    let data;
    try {
      data = await parseJsonResponse(response, `${API_BASE}/photos/upload`);
    } catch (error) {
      throw error;
    }

    if (!response.ok) {
      console.error("Photo upload failed", {
        url: `${API_BASE}/photos/upload`,
        status: response.status,
        statusText: response.statusText,
        responseBody: data
      });
      throw new Error(data?.error || "Failed to upload photo.");
    }
    return data;
  },
  // Attaches an already-uploaded photo (its storageUrl) to a specimen record.
  async addPhoto(specimenId, photo) {
    return request(`/specimens/${specimenId}/photos`, {
      method: "POST",
      body: JSON.stringify(photo)
    });
  },
  async updatePhoto(specimenId, photoId, updates) {
    return request(`/specimens/${specimenId}/photos/${photoId}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
  },
  async deletePhoto(specimenId, photoId) {
    return request(`/specimens/${specimenId}/photos/${photoId}`, {
      method: "DELETE"
    });
  },
  async reorderPhotos(specimenId, orderedPhotoIds) {
    return request(`/specimens/${specimenId}/photos/reorder`, {
      method: "POST",
      body: JSON.stringify({ orderedPhotoIds })
    });
  },
  // Activity & Dashboard
  async getDashboardStats() {
    return request("/dashboard/stats");
  },
  async getPublicStats() {
    return request("/public/stats");
  },
  async getActivityLogs(limit = 50, action, specimenId) {
    const query = new URLSearchParams();
    if (limit) query.append("limit", String(limit));
    if (action) query.append("action", action);
    if (specimenId) query.append("specimenId", specimenId);
    return request(`/activity-logs?${query.toString()}`);
  },
  // Contact
  async submitContact(data) {
    return request("/contact", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async getContactMessages() {
    return request("/contact/messages");
  }
};
export {
  api
};
