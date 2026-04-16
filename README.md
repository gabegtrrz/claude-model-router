# claude-model-router

Switch between Claude and any Anthropic-compatible model provider inside a single Claude Code session — no restarts, no reconfiguring.

A tiny Node.js proxy sits between Claude Code and the model APIs. It reads the model name from each request and routes it to the right provider. You configure providers in a JSON file — no code changes needed to add one.

```
/model opus           → Anthropic (your normal Claude auth, passthrough)
/model mimo-v2-pro    → Xiaomi MiMo
/model kimi-k2.5      → Moonshot Kimi
/model <anything>     → whatever you configure in routes.json
```

**Windows only** (PowerShell + `.cmd` launchers). Requires Node.js 18+.

---

## Install

```powershell
git clone https://github.com/gabegtrrz/claude-model-router
cd claude-model-router
.\install.ps1
```

This copies the scripts to `~/bin`, copies `routes.json` to `~/bin` (your editable config), and adds launcher functions to your PowerShell profile.

### Set your API keys

Keys are stored as Windows user environment variables — nothing is hardcoded anywhere.

```powershell
[Environment]::SetEnvironmentVariable("MIMO_API_KEY", "sk-your-key", "User")
[Environment]::SetEnvironmentVariable("KIMI_API_KEY", "your-key", "User")
```

Open a new terminal tab. Done.

---

## Usage

### Multi-model (switch mid-session)

```powershell
claude-multi
```

Then inside Claude Code, switch models with `/model`:

| Command | Routes to |
|---------|-----------|
| `/model opus` | Claude Opus |
| `/model sonnet` | Claude Sonnet |
| `/model mimo-v2-pro` | Xiaomi MiMo V2 Pro |
| `/model kimi-k2.5` | Moonshot Kimi K2.5 |

All flags pass through:

```powershell
claude-multi --dangerously-skip-permissions --chrome
```

### Single-model launchers

For when you want one provider and no proxy overhead:

```powershell
claude        # Claude (default, no proxy)
claude-mimo   # MiMo only
claude-kimi   # Kimi only
```

---

## Adding a provider

Edit `~/bin/routes.json`:

```json
{
  "routes": [
    {
      "prefix": "mimo",
      "name": "Xiaomi MiMo",
      "host": "api.xiaomimimo.com",
      "basePath": "/anthropic",
      "apiKeyEnv": "MIMO_API_KEY"
    },
    {
      "prefix": "kimi",
      "name": "Moonshot Kimi",
      "host": "api.moonshot.ai",
      "basePath": "/anthropic",
      "apiKeyEnv": "KIMI_API_KEY"
    },
    {
      "prefix": "my-model",
      "name": "My Provider",
      "host": "api.myprovider.com",
      "basePath": "/anthropic",
      "apiKeyEnv": "MY_PROVIDER_API_KEY"
    }
  ]
}
```

**Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `prefix` | yes | Model name prefix to match (e.g. `"mimo"` matches `mimo-v2-pro`, `mimo-*`) |
| `host` | yes | API hostname |
| `basePath` | no | Path prefix before the endpoint (e.g. `"/anthropic"`) |
| `name` | no | Display name shown in proxy logs |
| `apiKeyEnv` | yes | Name of the env var holding the API key |

Routes are matched in order — first match wins. Anthropic is always the final fallback.

The provider must expose an **Anthropic-compatible API** (i.e. `/anthropic/v1/messages`). Most major providers do.

---

## How it works

`claude-multi` starts `claude-proxy.mjs` in a minimized background window, points `ANTHROPIC_BASE_URL` at it (`http://127.0.0.1:8377`), then launches Claude Code.

For every request:
1. The proxy reads the `model` field from the request body
2. Matches it against your `routes.json`
3. Forwards to the right host, swapping in the provider's API key

Anthropic requests pass through with the original auth untouched — your Claude subscription or API key works as-is. The proxy window is killed when Claude Code exits.

---

## Managing API keys

```powershell
# View
[Environment]::GetEnvironmentVariable("MIMO_API_KEY", "User")

# Set or update
[Environment]::SetEnvironmentVariable("MIMO_API_KEY", "sk-new-key", "User")

# Remove
[Environment]::SetEnvironmentVariable("MIMO_API_KEY", $null, "User")
```

Open a new terminal tab after any change.

---

## Options

**Custom port** (default: `8377`):
```powershell
$env:CLAUDE_PROXY_PORT = "9000"
claude-multi
```

**Custom routes file location** (default: `~/bin/routes.json`):
```powershell
$env:CLAUDE_PROXY_ROUTES = "C:\path\to\my-routes.json"
claude-multi
```

---

## License

MIT
