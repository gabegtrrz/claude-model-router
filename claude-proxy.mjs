import { createServer } from "node:http";
import { request as httpsRequest } from "node:https";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = parseInt(process.env.CLAUDE_PROXY_PORT || "8377");
const __dir = dirname(fileURLToPath(import.meta.url));

// Load routes from routes.json next to this script.
// Override location with CLAUDE_PROXY_ROUTES env var.
const routesPath = process.env.CLAUDE_PROXY_ROUTES
  ? resolve(process.env.CLAUDE_PROXY_ROUTES)
  : resolve(__dir, "routes.json");

let configuredRoutes = [];
try {
  const config = JSON.parse(readFileSync(routesPath, "utf8"));
  configuredRoutes = config.routes.map((r) => ({
    prefix: r.prefix,
    match: (model) => model?.startsWith(r.prefix),
    host: r.host,
    basePath: r.basePath ?? "",
    apiKey: process.env[r.apiKeyEnv] ?? null,
    name: r.name ?? r.prefix,
  }));
} catch (err) {
  console.error(`[proxy] Failed to load routes from ${routesPath}: ${err.message}`);
  console.error(`[proxy] Create a routes.json file next to this script. See README.`);
  process.exit(1);
}

// Anthropic is always the fallback — passthrough auth, no key override.
const routes = [
  ...configuredRoutes,
  {
    match: () => true,
    host: "api.anthropic.com",
    basePath: "",
    apiKey: null,
    name: "Anthropic",
  },
];

function extractModel(body) {
  try {
    return JSON.parse(body).model;
  } catch {
    return null;
  }
}

const server = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const model = extractModel(body);
    const route = routes.find((r) => r.match(model));
    const targetPath = route.basePath + req.url;

    const headers = { ...req.headers };
    delete headers["host"];
    headers["host"] = route.host;

    // Only override auth for third-party providers.
    // For Anthropic, pass through whatever Claude Code sent (OAuth token, API key, etc.)
    if (route.apiKey) {
      headers["x-api-key"] = route.apiKey;
      headers["authorization"] = `Bearer ${route.apiKey}`;
    }

    if (model) {
      process.stderr.write(`[proxy] ${model} → ${route.name} (${route.host})\n`);
    }

    const proxyReq = httpsRequest(
      { hostname: route.host, port: 443, path: targetPath, method: req.method, headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on("error", (err) => {
      process.stderr.write(`[proxy] Error → ${route.name}: ${err.message}\n`);
      res.writeHead(502);
      res.end(JSON.stringify({ error: err.message }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Claude model proxy on http://127.0.0.1:${PORT}`);
  console.log(`  Routes loaded from: ${routesPath}`);
  for (const r of configuredRoutes) {
    const keyStatus = r.apiKey ? "key set" : "WARNING: no key";
    console.log(`  ${r.name.padEnd(20)} "${r.prefix}*" → ${r.host} (${keyStatus})`);
  }
  console.log(`  ${"Anthropic (fallback)".padEnd(20)} * → api.anthropic.com (passthrough auth)`);
});
