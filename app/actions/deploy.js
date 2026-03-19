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
 * Liste des projets déployables
 */
export async function getDeployProjects() {
  try {
    const res = await adminApiFetch("/api/deploy/projects");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Erreur ${res.status}`);
    }
    return data.projects || [];
  } catch (err) {
    console.error("getDeployProjects:", err.message);
    throw err;
  }
}

/**
 * Lance un déploiement pour un projet
 */
export async function runDeploy(projectId) {
  try {
    const res = await adminApiFetch(`/api/deploy/${projectId}`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Erreur ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error("runDeploy:", err.message);
    throw err;
  }
}

/**
 * Récupère le statut du déploiement pour un projet
 */
export async function getDeployStatus(projectId) {
  try {
    const res = await adminApiFetch(`/api/deploy/${projectId}/status`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Erreur ${res.status}`);
    }
    return data.status || { status: "idle", projectId };
  } catch (err) {
    console.error("getDeployStatus:", err.message);
    throw err;
  }
}

/**
 * Liste des derniers déploiements GitHub Actions pour un projet
 */
export async function getDeployRuns(projectId) {
  try {
    const res = await adminApiFetch(`/api/deploy/${projectId}/runs`);
    const data = await res.json();
    if (!res.ok) {
      return [];
    }
    return data.runs || [];
  } catch (err) {
    console.error("getDeployRuns:", err.message);
    return [];
  }
}

