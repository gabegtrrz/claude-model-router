# claude-model-router

Switch between Claude, MiMo, and Kimi inside a single Claude Code session — no restarts, no reconfiguring.

A tiny Node.js proxy sits between Claude Code and the model APIs. It reads the model name from each request and routes it to the right provider automatically.

```
/model opus          → Anthropic (your normal Claude auth)
/model mimo-v2-pro   → Xiaomi MiMo
/model kimi-k2.5     → Moonshot Kimi
```

**Windows only** (PowerShell + `.cmd` launchers). Requires Node.js 18+.

---

## Install

```powershell
git clone https://github.com/gabegtrrz/claude-model-router
cd claude-model-router
.\install.ps1
```

The installer copies the scripts to `~/bin` and adds launcher functions to your PowerShell profile.

### Set your API keys

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

Then inside the session:

| Command | Routes to |
|---------|-----------|
| `/model opus` | Claude Opus |
| `/model sonnet` | Claude Sonnet |
| `/model mimo-v2-pro` | Xiaomi MiMo V2 Pro |
| `/model kimi-k2.5` | Moonshot Kimi K2.5 |

Flags pass through normally:

```powershell
claude-multi --dangerously-skip-permissions --chrome
```

### Single-model launchers

If you just want one provider per session:

```powershell
claude        # Claude (default, no proxy)
claude-mimo   # MiMo only
claude-kimi   # Kimi only
```

---

## How it works

`claude-multi` starts `claude-proxy.mjs` as a background process, points `ANTHROPIC_BASE_URL` at it (`http://127.0.0.1:8377`), then launches Claude Code.

For every API request, the proxy:
1. Reads the `model` field from the request body
2. Matches it against the route table
3. Forwards to the right host with the right auth header

Anthropic requests pass through with the original auth untouched — so your Claude subscription or API key just works. Third-party providers get their own key injected from env vars.

The proxy window is minimized while you work and killed when Claude Code exits.

---

## Managing API keys

| Provider | Get your key |
|----------|-------------|
| MiMo | https://platform.xiaomimimo.com → API Keys (format: `sk-xxxxx`) |
| Kimi | https://platform.kimi.ai/console/api-keys |
| Claude | Managed by Claude Code — no key needed here |

**View current keys:**
```powershell
[Environment]::GetEnvironmentVariable("MIMO_API_KEY", "User")
[Environment]::GetEnvironmentVariable("KIMI_API_KEY", "User")
```

**Update a key:**
```powershell
[Environment]::SetEnvironmentVariable("MIMO_API_KEY", "sk-new-key", "User")
```

After updating, open a new terminal tab.

**Remove a key:**
```powershell
[Environment]::SetEnvironmentVariable("MIMO_API_KEY", $null, "User")
```

---

## Custom port

The proxy defaults to port `8377`. Override it:

```powershell
$env:CLAUDE_PROXY_PORT = "9000"
claude-multi
```

---

## License

MIT
