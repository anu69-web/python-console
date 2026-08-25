# 🐍 Python Console — In-Browser WebAssembly IDE

[![Live WebApp](https://img.shields.io/badge/Live_WebApp-GitHub_Pages-22272E?style=for-the-badge&logo=githubpages)](https://anu69-web.github.io/python-console/)
[![Telegram WebApp](https://img.shields.io/badge/Telegram_WebApp-t.me%2Fpy__runbot%2Fconsole-2CA5E0?style=for-the-badge&logo=telegram)](https://t.me/py_runbot/console)
[![Engine](https://img.shields.io/badge/Runtime-Pyodide_CPython_3.12_WASM-3776AB?style=for-the-badge&logo=webassembly)](https://pyodide.org/)
[![Editor](https://img.shields.io/badge/Editor-CodeMirror_5-D83B01?style=for-the-badge)](https://codemirror.net/)

An interactive, responsive in-browser Python IDE and compiler engineered with **Pyodide WebAssembly (WASM)** and **CodeMirror**. Designed for zero-install client-side Python execution inside Telegram WebApps and modern desktop/mobile web browsers.

---

## ⚡ Key Features

- 🐍 **Client-Side CPython 3.12 WebAssembly Engine**:
  - Powered by Pyodide, executing full standard-library Python code locally in the browser sandbox with zero backend server dependency.
  - Intercepts `sys.stdout` and `sys.stderr` streams in real-time.
  - Interactive asynchronous `input()` prompt modal bridge for interactive user inputs.

- 💻 **CodeMirror 5 Integrated Editor**:
  - Smart Python syntax highlighting and active line indicator.
  - Intelligent Python keyword and built-in autocompletion (IntelliSense).
  - Auto-closing brackets and string quotes (`()`, `[]`, `{}`, `""`, `''`).
  - Context-aware 4-space auto-indentation (especially following colons `:`).

- 📱 **Mobile Touch Optimization & Virtual Symbols Bar**:
  - One-tap quick symbol keyboard toolbar (`Tab`, `:`, `(`, `)`, `[`, `]`, `{`, `}`, `=`, `"`, `'`, `_`, `#`, `+`, `-`, `*`, `/`) to eliminate tedious mobile keyboard sub-menu switching.
  - Responsive viewport scaling with adjustable font sizes.

- 🤖 **Telegram WebApp SDK Bridge**:
  - Full native Telegram theme adaptation (extracts CSS variables from Telegram client).
  - Viewport auto-expansion via `Telegram.WebApp.expand()`.
  - Haptic feedback triggers on code execution and error events.
  - One-tap "Send to Bot" code snippet passing directly back to active chat sessions.

---

## 🚀 Live Deployment & Links

- **Standalone Web URL**: [https://anu69-web.github.io/python-console/](https://anu69-web.github.io/python-console/)
- **Telegram WebApp Short Link**: [t.me/py_runbot/console](https://t.me/py_runbot/console)

---

## 🛠️ Telegram Bot Integration

Integrated directly with `telegram-bots/bot.py`:
- Configured as a persistent bottom-bar menu button (`MenuButtonWebApp`).
- Accessible via inline commands `/console` or `.console`.
- Accepts URL query parameters `?chat_id=<id>&user_id=<id>` for seamless session binding.

---

## 📄 License
Open-source software maintained by [anu69-web](https://github.com/anu69-web).
