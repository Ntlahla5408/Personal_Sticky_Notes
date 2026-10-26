import { buildPushPayload } from "@block65/webcrypto-web-push";

const ALLOWED_GOALS = new Set([1, 3, 5, 8, 10, 15, 20]);
const DEFAULT_TIME_ZONE = "Africa/Johannesburg";
const encoder = new TextEncoder();

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers }
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.FRONTEND_ORIGIN && env.FRONTEND_ORIGIN !== "SET_TO_YOUR_GITHUB_PAGES_ORIGIN" && origin === env.FRONTEND_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Device-Token",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function isAllowedOrigin(request, env) {
  return Boolean(env.FRONTEND_ORIGIN &&
    env.FRONTEND_ORIGIN !== "SET_TO_YOUR_GITHUB_PAGES_ORIGIN" &&
    request.headers.get("Origin") === env.FRONTEND_ORIGIN);
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function limited(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await sha256(ip);
  const day = new Date().toISOString().slice(0, 10);
  await env.DB.prepare(
    "INSERT INTO request_limits (ip_hash, local_day, request_count) VALUES (?, ?, 1) ON CONFLICT(ip_hash, local_day) DO UPDATE SET request_count = request_count + 1"
  ).bind(ipHash, day).run();
  const row = await env.DB.prepare(
    "SELECT request_count FROM request_limits WHERE ip_hash = ? AND local_day = ?"
  ).bind(ipHash, day).first();
  return (row?.request_count || 0) <= 100;
}

function readLocalParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return {
    year: Number(values.year), month: Number(values.month), day: Number(values.day),
    hour: Number(values.hour), minute: Number(values.minute),
    dateKey: values.year + "-" + values.month + "-" + values.day
  };
}

function localTimeToEpochSeconds(year, month, day, hour, minute, timeZone) {
  const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = desired;
  for (let attempt = 0; attempt < 4; attempt++) {
    const local = readLocalParts(new Date(guess), timeZone);
    const observed = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, 0);
    guess += desired - observed;
  }
  return Math.floor(guess / 1000);
}

function nextSlotEpoch(row, dateKey, slot) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const goal = row.daily_goal;
  const startMinute = row.start_hour * 60;
  const endMinute = row.end_hour * 60;
  const duration = endMinute - startMinute;
  const slotStart = startMinute + Math.floor(slot * duration / goal);
  const slotEnd = startMinute + Math.floor((slot + 1) * duration / goal);
  const range = Math.max(1, slotEnd - slotStart);
  const minute = slotStart + Math.floor(Math.random() * range);
  return localTimeToEpochSeconds(year, month, day, Math.floor(minute / 60), minute % 60, row.time_zone);
}

function validTimeZone(timeZone) {
  try { new Intl.DateTimeFormat("en-US", { timeZone }).format(); return true; }
  catch { return false; }
}

function validAppUrl(value, origin) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === origin ? url.href : null;
  } catch { return null; }
}

function getVapid(env) {
  if (!env.VAPID_SERVER_PUBLIC_KEY || !env.VAPID_SERVER_PRIVATE_KEY || !env.VAPID_SUBJECT) {
    throw new Error("Push signing keys are not configured.");
  }
  return {
    subject: env.VAPID_SUBJECT,
    publicKey: env.VAPID_SERVER_PUBLIC_KEY,
    privateKey: env.VAPID_SERVER_PRIVATE_KEY
  };
}

async function deliver(env, row, title, body, tag = "little-notes-surprise") {
  const subscription = JSON.parse(row.subscription_json);
  const message = {
    data: JSON.stringify({
      title,
      body,
      tag,
      data: { url: row.app_url + (row.app_url.includes("?") ? "&" : "?") + "surprise=1" }
    }),
    options: { ttl: 3600, urgency: "normal" }
  };
  const payload = await buildPushPayload(message, subscription, getVapid(env));
  const response = await fetch(subscription.endpoint, payload);
  if (response.status === 404 || response.status === 410) {
    await env.DB.prepare("DELETE FROM subscriptions WHERE endpoint = ?").bind(subscription.endpoint).run();
    return "expired";
  }
  if (!response.ok) throw new Error("Push service returned HTTP " + response.status);
  return "sent";
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const cors = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(request, env)) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: cors });
  }

  if (url.pathname === "/api/config" && request.method === "GET") {
    if (!isAllowedOrigin(request, env)) return json({ error: "Origin not allowed." }, 403, cors);
    if (!env.VAPID_SERVER_PUBLIC_KEY) return json({ error: "Push service is not configured yet." }, 503, cors);
    return json({ publicKey: env.VAPID_SERVER_PUBLIC_KEY }, 200, cors);
  }

  if (!url.pathname.startsWith("/api/")) return json({ error: "Not found." }, 404, cors);
  if (!isAllowedOrigin(request, env)) return json({ error: "Origin not allowed." }, 403, cors);
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, cors);
  if (!(await limited(request, env))) return json({ error: "Daily request limit reached. Try again tomorrow." }, 429, cors);

  const deviceToken = request.headers.get("X-Device-Token") || "";
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(deviceToken)) return json({ error: "A valid device token is required." }, 401, cors);
  const tokenHash = await sha256(deviceToken);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Request body must be valid JSON." }, 400, cors); }

  if (url.pathname === "/api/subscribe") {
    const sub = body.subscription;
    let endpointUrl;
    try { endpointUrl = new URL(sub?.endpoint); } catch { endpointUrl = null; }
    const allowedPushHost = endpointUrl && (endpointUrl.hostname === "fcm.googleapis.com" ||
      endpointUrl.hostname === "updates.push.services.mozilla.com" ||
      endpointUrl.hostname === "push.services.mozilla.com" ||
      endpointUrl.hostname === "web.push.apple.com" ||
      endpointUrl.hostname.endsWith(".notify.windows.com"));
    if (!sub || !endpointUrl || endpointUrl.protocol !== "https:" || endpointUrl.port && endpointUrl.port !== "443" || !allowedPushHost ||
        !sub.keys || typeof sub.keys.p256dh !== "string" || typeof sub.keys.auth !== "string") {
      return json({ error: "Invalid push subscription." }, 400, cors);
    }
    const appUrl = validAppUrl(body.appUrl, env.FRONTEND_ORIGIN);
    const goal = Number(body.dailyGoal);
    const startHour = Number(body.startHour ?? 8);
    const endHour = Number(body.endHour ?? 22);
    const timeZone = typeof body.timeZone === "string" && validTimeZone(body.timeZone) ? body.timeZone : DEFAULT_TIME_ZONE;
    if (!appUrl) return json({ error: "App URL must match the configured GitHub Pages origin." }, 400, cors);
    if (!ALLOWED_GOALS.has(goal) || !Number.isInteger(startHour) || !Number.isInteger(endHour) ||
        startHour < 0 || startHour > 23 || endHour < 1 || endHour > 24 || endHour <= startHour) {
      return json({ error: "Invalid daily goal or active hours." }, 400, cors);
    }
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare("DELETE FROM subscriptions WHERE device_token_hash = ? AND endpoint != ?").bind(tokenHash, sub.endpoint).run();
    const local = readLocalParts(new Date(), timeZone);
    const row = {
      endpoint: sub.endpoint,
      subscription_json: JSON.stringify(sub),
      device_token_hash: tokenHash,
      app_url: appUrl,
      daily_goal: goal,
      time_zone: timeZone,
      start_hour: startHour,
      end_hour: endHour,
      local_day: local.dateKey,
      sent_count: 0,
      next_send_at: null,
      paused: 0,
      created_at: now,
      updated_at: now
    };
    row.next_send_at = nextSlotEpoch(row, local.dateKey, 0);
    await env.DB.prepare(`INSERT INTO subscriptions
      (endpoint, subscription_json, device_token_hash, app_url, daily_goal, time_zone, start_hour, end_hour, local_day, sent_count, next_send_at, paused, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(endpoint) DO UPDATE SET
      subscription_json=excluded.subscription_json, device_token_hash=excluded.device_token_hash,
      app_url=excluded.app_url, daily_goal=excluded.daily_goal, time_zone=excluded.time_zone,
      start_hour=excluded.start_hour, end_hour=excluded.end_hour, local_day=excluded.local_day,
      sent_count=0, next_send_at=excluded.next_send_at, paused=0, updated_at=excluded.updated_at`)
      .bind(row.endpoint, row.subscription_json, row.device_token_hash, row.app_url, row.daily_goal, row.time_zone,
        row.start_hour, row.end_hour, row.local_day, row.sent_count, row.next_send_at, row.paused, row.created_at, row.updated_at).run();
    return json({ ok: true, message: "Notifications enabled." }, 200, cors);
  }

  if (url.pathname === "/api/unsubscribe") {
    await env.DB.prepare("DELETE FROM subscriptions WHERE device_token_hash = ?").bind(tokenHash).run();
    return json({ ok: true }, 200, cors);
  }

  const row = await env.DB.prepare("SELECT * FROM subscriptions WHERE device_token_hash = ? LIMIT 1").bind(tokenHash).first();
  if (!row) return json({ error: "This device is not registered. Enable notifications again." }, 404, cors);

  if (url.pathname === "/api/pause") {
    const paused = body.paused === true;
    const now = Math.floor(Date.now() / 1000);
    let nextSendAt = row.next_send_at;
    let sentCount = row.sent_count;
    const local = readLocalParts(new Date(now * 1000), row.time_zone);
    if (row.local_day !== local.dateKey) sentCount = 0;
    if (!paused && sentCount < row.daily_goal && local.hour >= row.start_hour && local.hour < row.end_hour) {
      const candidate = nextSlotEpoch(row, local.dateKey, sentCount);
      nextSendAt = Math.max(candidate, now + 300);
    }
    await env.DB.prepare("UPDATE subscriptions SET paused = ?, local_day = ?, sent_count = ?, next_send_at = ?, updated_at = ? WHERE device_token_hash = ?")
      .bind(paused ? 1 : 0, local.dateKey, sentCount, nextSendAt, now, tokenHash).run();
    return json({ ok: true, paused }, 200, cors);
  }

  if (url.pathname === "/api/settings") {
    const goal = Number(body.dailyGoal);
    const startHour = Number(body.startHour ?? row.start_hour);
    const endHour = Number(body.endHour ?? row.end_hour);
    if (!ALLOWED_GOALS.has(goal) || !Number.isInteger(startHour) || !Number.isInteger(endHour) ||
        startHour < 0 || startHour > 23 || endHour < 1 || endHour > 24 || endHour <= startHour) {
      return json({ error: "Invalid daily goal or active hours." }, 400, cors);
    }
    const local = readLocalParts(new Date(), row.time_zone);
    const updated = { ...row, daily_goal: goal, start_hour: startHour, end_hour: endHour, local_day: local.dateKey };
    const sentCount = row.local_day === local.dateKey ? Math.min(row.sent_count, goal) : 0;
    const nextSend = sentCount < goal ? nextSlotEpoch(updated, local.dateKey, sentCount) : null;
    await env.DB.prepare("UPDATE subscriptions SET daily_goal=?, start_hour=?, end_hour=?, local_day=?, sent_count=?, next_send_at=?, updated_at=? WHERE device_token_hash=?")
      .bind(goal, startHour, endHour, local.dateKey, sentCount, nextSend, Math.floor(Date.now() / 1000), tokenHash).run();
    return json({ ok: true }, 200, cors);
  }

  if (url.pathname === "/api/test") {
    try {
      const result = await deliver(env, row, "Little Notes is connected", "Your browser push notification is working.", "little-notes-test");
      return json({ ok: true, result }, 200, cors);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Test notification failed." }, 502, cors);
    }
  }

  return json({ error: "Not found." }, 404, cors);
}

async function runScheduler(controller, env) {
  const now = Math.floor(Date.now() / 1000);
  const result = await env.DB.prepare("SELECT * FROM subscriptions WHERE paused = 0").all();
  for (const original of result.results || []) {
    try {
      const row = original;
      const local = readLocalParts(new Date(now * 1000), row.time_zone);
      let sentCount = row.sent_count;
      let nextSendAt = row.next_send_at;
      if (row.local_day !== local.dateKey) {
        sentCount = 0;
        nextSendAt = nextSlotEpoch(row, local.dateKey, 0);
        await env.DB.prepare("UPDATE subscriptions SET local_day=?, sent_count=0, next_send_at=?, updated_at=? WHERE endpoint=?")
          .bind(local.dateKey, nextSendAt, now, row.endpoint).run();
      }
      if (sentCount >= row.daily_goal || local.hour < row.start_hour || local.hour >= row.end_hour) continue;
      if (nextSendAt == null) {
        nextSendAt = nextSlotEpoch(row, local.dateKey, sentCount);
        await env.DB.prepare("UPDATE subscriptions SET next_send_at=? WHERE endpoint=?").bind(nextSendAt, row.endpoint).run();
      }
      if (now < nextSendAt) continue;
      await deliver(env, row, "A little tech surprise is waiting", "Open Little Notes for a small discovery.", "little-notes-surprise");
      sentCount += 1;
      const next = sentCount < row.daily_goal ? nextSlotEpoch(row, local.dateKey, sentCount) : null;
      await env.DB.prepare("UPDATE subscriptions SET sent_count=?, next_send_at=?, updated_at=? WHERE endpoint=?")
        .bind(sentCount, next, now, row.endpoint).run();
    } catch (error) {
      // A failed delivery is retried on a later cron tick; no private subscription data is logged.
      if (error instanceof Error) console.error("Little Notes push delivery failed:", error.message);
    }
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      const cors = corsHeaders(request, env);
      if (!isAllowedOrigin(request, env)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors });
    }
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error("Little Notes push request failed:", error instanceof Error ? error.message : "Unknown error");
      return json({ error: "The push service could not complete that request." }, 500, corsHeaders(request, env));
    }
  },
  async scheduled(controller, env, context) {
    context.waitUntil(runScheduler(controller, env));
  }
};
