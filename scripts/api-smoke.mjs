const baseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://homenet-api.vercel.app").replace(/\/$/, "");

function assertEnvelope(value, label) {
  if (!value || typeof value !== "object" || typeof value.success !== "boolean" || !("data" in value)) {
    throw new Error(`${label} did not return the documented API envelope.`);
  }
}

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  assertEnvelope(payload, path);
  if (!response.ok || !payload.success) {
    throw new Error(`${path}: ${payload.message || `HTTP ${response.status}`}`);
  }
  return payload;
}

async function main() {
  console.log(`Checking ${baseUrl}`);
  await request("/v1/areas?page=1&limit=1");
  console.log("Public areas envelope passed.");
  await request("/v1/properties?page=1&limit=1");
  console.log("Public properties envelope passed.");

  const email = process.env.HOMENET_TEST_EMAIL;
  const password = process.env.HOMENET_TEST_PASSWORD;
  if (!email || !password) {
    console.log("Authenticated checks skipped; set HOMENET_TEST_EMAIL and HOMENET_TEST_PASSWORD to enable them.");
    return;
  }

  const login = await request("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const accessToken = login.data?.access_token;
  const refreshToken = login.data?.refresh_token;
  if (!accessToken || !refreshToken) throw new Error("Login response did not include both tokens.");
  console.log("Login envelope passed.");

  await request("/v1/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } });
  console.log("Current-user envelope passed.");

  const refreshed = await request("/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const rotatedAccessToken = refreshed.data?.access_token;
  const rotatedRefreshToken = refreshed.data?.refresh_token;
  if (!rotatedAccessToken || !rotatedRefreshToken) {
    throw new Error("Refresh response did not include rotated tokens.");
  }
  console.log("Refresh envelope passed.");

  await request("/v1/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${rotatedAccessToken}` },
    body: JSON.stringify({ refresh_token: rotatedRefreshToken }),
  });
  console.log("Logout envelope passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
