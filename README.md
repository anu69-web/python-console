# Python Console — WebApp Compiler

An interactive, responsive in-browser Python IDE and compiler built for Telegram WebApps and standalone web execution.

## Features
- 🐍 **CPython 3.12 WebAssembly Engine**: Powered by [Pyodide](https://pyodide.org/), running completely client-side in the browser.
- ⚡ **Real-time Output & Input Handling**: Intercepts `print()`, standard errors, execution benchmarks, and handles interactive `input()` prompts seamlessly.
- 💻 **Modern CodeMirror Editor**:
  - Auto-indentation (4-space tabs, smart indentation after colons `:`)
  - Auto-closing brackets and quotes (`()`, `[]`, `{}`, `""`, `''`)
  - Active line highlighting & bracket matching
  - Intelligent Python keyword & built-in autocompletion (IntelliSense)
- 📱 **Mobile Touch Optimization**:
  - Quick Virtual Symbols toolbar (`Tab`, `:`, `(`, `)`, `[`, `]`, `{`, `}`, `=`, `"`, `'`, `_`, `#`, `+`, `-`, `*`, `/`)
  - Responsive layout adjusting smoothly on mobile screens & Telegram WebViews
- 🤖 **Telegram WebApp Integration**:
  - Supports Telegram theme variables, viewport auto-expansion (`expand()`), and haptic feedback
  - "Send to Bot" action button passing code snippets back to Telegram chat sessions.

## Live Deployment
- **Web URL**: [https://anu69-web.github.io/python-console/](https://anu69-web.github.io/python-console/)
- **Telegram Web App Direct Link**: [t.me/py_runbot/console](https://t.me/py_runbot/console)

## Telegram Bot Integration
Linked with `telegram-bots/bot.py` via `MenuButtonWebApp`, direct short link `t.me/py_runbot/console`, and `/console` commands.
