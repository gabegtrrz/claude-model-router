@echo off
REM Launch Claude Code using Kimi K2.5 via Moonshot AI
REM Docs: https://platform.kimi.ai/docs/guide/agent-support

set ANTHROPIC_BASE_URL=https://api.moonshot.ai/anthropic
set ANTHROPIC_AUTH_TOKEN=%KIMI_API_KEY%
set ANTHROPIC_MODEL=kimi-k2.5
set ANTHROPIC_DEFAULT_OPUS_MODEL=kimi-k2.5
set ANTHROPIC_DEFAULT_SONNET_MODEL=kimi-k2.5
set ANTHROPIC_DEFAULT_HAIKU_MODEL=kimi-k2.5
set CLAUDE_CODE_SUBAGENT_MODEL=kimi-k2.5
set ENABLE_TOOL_SEARCH=false
set CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1

claude %*
