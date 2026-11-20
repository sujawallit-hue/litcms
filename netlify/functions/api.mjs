import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const store = getStore("laar-data");

const ENTITIES = [
  "students", "teachers", "courses", "shifts", "batches", "modules",
  "topics", "lessons", "attendance", "progress", "practicals", "tests", "results"
];

const send = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

const defaults = () => Object.fromEntries(ENTITIES.map(name => [name, []]));

async function database() {
  const saved = await store.get("database", { type: "json" });
  return saved && typeof saved === "object" ? { ...defaults(), ...saved } : defaults();
}

async function saveDatabase(data) {
  await store.setJSON("database", data);
}

function credentials() {
  return {
    username: process.env.PRINCIPAL_USERNAME || "litprincicpal",
    password: process.env.PRINCIPAL_PASSWORD || "lit2026"
  };
}

async function createSession() {
  const token = crypto.randomBytes(32).toString("hex");
  await store.setJSON(`session:${token}`, {
    expiresAt: Date.now() + 12 * 60 * 60 * 1000
  });
  return token;
}

async function authorized(request) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7).trim();
  if (!token) return false;
  const session = await store.get(`session:${token}`, { type: "json" });
  return !!session && Number(session.expiresAt) > Date.now();
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/?/, "").replace(/\/+$/, "");
    const method = request.method.toUpperCase();

    if (method === "GET" && path === "health") {
      return send(200, { ok: true, service: "LIT Management API" });
    }

    if (method === "POST" && path === "login") {
      const body = await readJson(request);
      const creds = credentials();

      if (body.username !== creds.username || body.password !== creds.password) {
        return send(401, { ok: false, message: "Invalid username or password." });
      }

      const token = await createSession();
      return send(200, {
        ok: true,
        token,
        user: { username: creds.username, role: "Principal" }
      });
    }

    if (!(await authorized(request))) {
      return send(401, { ok: false, message: "Unauthorized. Please login again." });
    }

    if (method === "POST" && path === "logout") {
      const auth = request.headers.get("authorization") || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
      if (token) await store.delete(`session:${token}`);
      return send(200, { ok: true });
    }

    if (method === "GET" && (path === "" || path === "data")) {
      return send(200, { ok: true, data: await database() });
    }

    if (method === "POST" && path === "data") {
      const body = await readJson(request);
      if (!body || !ENTITIES.includes(body.entity)) {
        return send(400, { ok: false, message: "Invalid entity." });
      }

      const data = await database();
      const record = { ...(body.record || {}) };
      record.id ||= crypto.randomUUID();
      record.updatedAt = new Date().toISOString();

      const list = Array.isArray(data[body.entity]) ? data[body.entity] : [];
      const index = list.findIndex(item => item.id === record.id);
      if (index >= 0) list[index] = record;
      else list.push(record);

      data[body.entity] = list;
      await saveDatabase(data);
      return send(200, { ok: true, record });
    }

    if (method === "DELETE" && path === "data") {
      const body = await readJson(request);
      if (!body || !ENTITIES.includes(body.entity) || !body.id) {
        return send(400, { ok: false, message: "Invalid delete request." });
      }

      const data = await database();
      data[body.entity] = (data[body.entity] || []).filter(item => item.id !== body.id);
      await saveDatabase(data);
      return send(200, { ok: true });
    }

    return send(404, { ok: false, message: "Endpoint not found." });
  } catch (error) {
    console.error("LIT API error:", error);
    return send(500, { ok: false, message: "Server error. Check Netlify Function logs." });
  }
}
