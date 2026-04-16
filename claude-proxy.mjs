import { createServer } from "node:http";
import { request as httpsRequest } from "node:https";

const PORT = parseInt(process.env.CLAUDE_PROXY_PORT || "8377");

// Route table: model prefix → { host, basePath, apiKey (null = passthrough) }
const routes = [
  {
    match: (model) => model?.startsWith("mimo"),
    host: "api.xiaomimimo.com",
    basePath: "/anthropic",
    apiKey: process.env.MIMO_API_KEY,
    name: "MiMo",
  },
  {
    match: (model) => model?.startsWith("kimi"),
    host: "api.moonshot.ai",
    basePath: "/anthropic",
    apiKey: process.env.KIMI_API_KEY,
    name: "Kimi",
  },
  {
    // Default: Anthropic — passthrough auth (OAuth/API key from Claude Code)
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

function findRoute(model) {
  return routes.find((r) => r.match(model));
}

const server = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const model = extractModel(body);
    const route = findRoute(model);

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
      {
        hostname: route.host,
        port: 443,
        path: targetPath,
        method: req.method,
        headers,
      },
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
  console.log(`  mimo-*  → api.xiaomimimo.com (key from MIMO_API_KEY)`);
  console.log(`  kimi-*  → api.moonshot.ai    (key from KIMI_API_KEY)`);
  console.log(`  *       → api.anthropic.com  (passthrough auth)`);
});
