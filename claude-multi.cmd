@echo off
REM Launch Claude Code with multi-model proxy (Claude + MiMo + Kimi)
REM Switch models mid-session with /model
REM   /model opus          → Claude Opus (default)
REM   /model mimo-v2-pro   → Xiaomi MiMo
REM   /model kimi-k2.5     → Moonshot Kimi

REM Start proxy in a minimized window
start "claude-proxy" /min node "%USERPROFILE%\bin\claude-proxy.mjs"

REM Give proxy a moment to start
timeout /t 2 /nobreak > NUL

set ANTHROPIC_BASE_URL=http://127.0.0.1:8377
set CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1

claude %*

REM Kill the proxy window when Claude exits
taskkill /fi "WINDOWTITLE eq claude-proxy*" > NUL 2>&1
