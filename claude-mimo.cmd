@echo off
REM Launch Claude Code using MiMo-V2-Pro via Xiaomi MiMo API
REM Docs: https://platform.xiaomimimo.com/#/docs/integration/claudecode

set ANTHROPIC_BASE_URL=https://api.xiaomimimo.com/anthropic
set ANTHROPIC_AUTH_TOKEN=%MIMO_API_KEY%
set ANTHROPIC_MODEL=mimo-v2-pro
set ANTHROPIC_DEFAULT_OPUS_MODEL=mimo-v2-pro
set ANTHROPIC_DEFAULT_SONNET_MODEL=mimo-v2-pro
set ANTHROPIC_DEFAULT_HAIKU_MODEL=mimo-v2-pro
set CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1

claude %*
