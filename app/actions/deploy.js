"use server";

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://admin-api:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function adminApiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (ADMIN_API_KEY) {
    headers["X-API-Key"] = ADMIN_API_KEY;
  }
  return fetch(`${ADMIN_API_URL}${path}`, { ...options, headers });
}

/**
 * Sites / conteneurs utilisant le registry custom
 */
export async function getRegistrySites() {
  try {
    const res = await adminApiFetch("/api/deploy/registry-sites");
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Erreur ${res.status}`);
    }
    return {
      sites: data.sites || [],
      pullHost: data.pullHost || null,
      count: data.count ?? 0,
    };
  } catch (err) {
    console.error("getRegistrySites:", err.message);
    throw err;
  }
}

/**
 * Met à jour le compose, pull le tag, recreate le service.
 * Ne throw pas : évite l'erreur RSC digest en prod.
 */
export async function redeployRegistrySite(containerId, tag) {
  try {
    const res = await adminApiFetch("/api/deploy/registry-redeploy", {
      method: "POST",
      body: JSON.stringify({ containerId, tag }),
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Erreur ${res.status}`,
      };
    }
    return {
      success: true,
      image: data.image,
      previousImage: data.previousImage,
      project: data.project,
      service: data.service,
    };
  } catch (err) {
    console.error("redeployRegistrySite:", err.message);
    return {
      success: false,
      error: err.message || "Erreur redeploy",
    };
  }
}
