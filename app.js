/**
 * Python Console - Interactive WebAssembly Compiler & IDE
 * Powered by Pyodide, CodeMirror, and Telegram WebApp SDK
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DOM Elements & State
  // =========================================================================
  const DOM = {
    engineStatus: document.getElementById('engine-status'),
    engineStatusText: document.getElementById('engine-status-text'),
    pulseDot: document.querySelector('.pulse-dot'),
    btnRun: document.getElementById('btn-run'),
    btnSendBot: document.getElementById('btn-send-bot'),
    editorContainer: document.getElementById('editor-container'),
    snippetSelect: document.getElementById('snippet-select'),
    btnFontInc: document.getElementById('btn-font-inc'),
    btnFontDec: document.getElementById('btn-font-dec'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    btnClearCode: document.getElementById('btn-clear-code'),
    quickSymbols: document.getElementById('quick-symbols'),
    terminalOutput: document.getElementById('terminal-output'),
    execTimeBadge: document.getElementById('exec-time-badge'),
    execTimeText: document.getElementById('exec-time-text'),
    btnCopyOutput: document.getElementById('btn-copy-output'),
    btnClearOutput: document.getElementById('btn-clear-output'),
    toastContainer: document.getElementById('toast-container'),
  };

  let pyodideInstance = null;
  let isPyodideReady = false;
  let isExecuting = false;
  let editorFontSize = 13.5;
  let editor = null;

  // =========================================================================
  // 2. Example Code Snippets
  // =========================================================================
  const SNIPPETS = {
    hello: `# 🐍 Welcome to Python Console!
# Write your Python code and click 'Run' (Ctrl+Enter)

def greet(name: str) -> str:
    return f"✨ Hello, {name}! Welcome to Python on Telegram."

print(greet("Developer"))
print("-" * 40)
print("System:", "CPython 3.12 WebAssembly Engine")
print("Ready to code!")
`,

    input_demo: `# 💬 Interactive Input Demonstration
name = input("Enter your name: ")
age = input("Enter your age: ")

try:
    age_num = int(age)
    years_to_100 = 100 - age_num
    print(f"\\n🎉 Hello {name}!")
    print(f"You will turn 100 years old in {years_to_100} years.")
except ValueError:
    print(f"\\n👋 Hello {name}, age '{age}' is not a valid number.")
`,

    fibonacci: `# 🔢 Fibonacci Sequence Generator
def fibonacci(n: int):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

n = 15
fib_series = fibonacci(n)
print(f"First {n} Fibonacci numbers:")
for idx, num in enumerate(fib_series, 1):
    print(f"F({idx:02d}) = {num}")
`,

    prime_sieve: `# ⚡ Sieve of Eratosthenes (Prime Numbers)
def find_primes(limit: int) -> list[int]:
    primes = []
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    
    for p in range(2, int(limit**0.5) + 1):
        if is_prime[p]:
            for i in range(p * p, limit + 1, p):
                is_prime[i] = False
                
    return [p for p in range(2, limit + 1) if is_prime[p]]

limit = 100
primes = find_primes(limit)
print(f"Found {len(primes)} primes up to {limit}:")
print(", ".join(map(str, primes)))
`,

    ascii_art: `# 🎨 ASCII Art Diamond Pattern
def draw_diamond(size: int):
    for i in range(size):
        spaces = " " * (size - i - 1)
        stars = "*" * (2 * i + 1)
        print(spaces + stars)
        
    for i in range(size - 2, -1, -1):
        spaces = " " * (size - i - 1)
        stars = "*" * (2 * i + 1)
        print(spaces + stars)

print("✦ Python ASCII Art Diamond ✦\\n")
draw_diamond(7)
`,

    calculator: `# 🧮 Math & Statistics Analysis
import math
import statistics

data = [12, 45, 67, 89, 23, 45, 91, 104, 56, 78, 34]

print(f"Data Set: {data}")
print(f"Count: {len(data)}")
print(f"Sum: {sum(data)}")
print(f"Mean (Average): {statistics.mean(data):.2f}")
print(f"Median: {statistics.median(data)}")
print(f"Standard Deviation: {statistics.stdev(data):.2f}")
print(f"Square root of Max ({max(data)}): {math.sqrt(max(data)):.4f}")
`,

    oop_demo: `# 🏗️ Object-Oriented Programming (OOP)
class Hero:
    def __init__(self, name: str, role: str, hp: int):
        self.name = name
        self.role = role
        self.hp = hp

    def attack(self, target, damage: int):
        print(f"⚔️ {self.name} attacks {target.name} for {damage} damage!")
        target.take_damage(damage)

    def take_damage(self, amount: int):
        self.hp = max(0, self.hp - amount)
        status = "Fainted!" if self.hp == 0 else f"{self.hp} HP remaining"
        print(f"🛡️ {self.name} has {status}")

wizard = Hero("Gandalf", "Mage", 120)
warrior = Hero("Aragorn", "Warrior", 180)

warrior.attack(wizard, 35)
wizard.attack(warrior, 50)
`
  };

  // =========================================================================
  // 3. Autocomplete Dictionary (Python Keywords & Builtins)
  // =========================================================================
  const PYTHON_KEYWORDS = [
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
    'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
    'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not',
    'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
    'True', 'False', 'None'
  ];

  const PYTHON_BUILTINS = [
    'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray',
    'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr',
    'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float',
    'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help',
    'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len',
    'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object',
    'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr',
    'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod',
    'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip', '__import__'
  ];

  const AUTOCOMPLETE_LIST = [...PYTHON_KEYWORDS, ...PYTHON_BUILTINS];

  // =========================================================================
  // 4. Initialize CodeMirror Editor
  // =========================================================================
  function initEditor() {
    editor = CodeMirror(DOM.editorContainer, {
      value: SNIPPETS.hello,
      mode: 'python',
      theme: 'dracula',
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      extraKeys: {
        'Ctrl-Enter': () => runCode(),
        'Cmd-Enter': () => runCode(),
        'Tab': (cm) => {
          if (cm.somethingSelected()) {
            cm.indentSelection('add');
          } else {
            cm.replaceSelection('    ', 'end');
          }
        },
        'Shift-Tab': (cm) => cm.indentSelection('subtract'),
        'Ctrl-Space': 'autocomplete',
      }
    });

    // Custom Python Hint Autocomplete Handler
    CodeMirror.registerHelper('hint', 'pythonCustom', function (cm) {
      const cur = cm.getCursor();
      const token = cm.getTokenAt(cur);
      const start = token.start;
      const end = cur.ch;
      const word = token.string.slice(0, end - start);

      if (!word || word.trim() === '') return null;

      const list = AUTOCOMPLETE_LIST.filter(item =>
        item.toLowerCase().startsWith(word.toLowerCase())
      );

      return {
        list: list,
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end)
      };
    });

    // Auto-trigger hints on typing alphanumeric
    editor.on('inputRead', function (cm, change) {
      if (change.origin !== '+input') return;
      const text = change.text[0];
      if (/^[a-zA-Z_]$/.test(text)) {
        CodeMirror.showHint(cm, CodeMirror.hint.pythonCustom, {
          completeSingle: false
        });
      }
    });

    // Load saved code from LocalStorage if available
    const savedCode = localStorage.getItem('python_console_code');
    if (savedCode) {
      editor.setValue(savedCode);
    }

    // Auto save on change
    editor.on('change', () => {
      localStorage.setItem('python_console_code', editor.getValue());
    });
  }

  // =========================================================================
  // 5. Initialize Telegram WebApp SDK
  // =========================================================================
  function initTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Set header color to match app
      if (tg.setHeaderColor) {
        tg.setHeaderColor('#11151f');
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#0c0f17');
      }

      console.log('Telegram WebApp Initialized for:', tg.initDataUnsafe?.user?.first_name || 'Guest');
    }
  }

  function triggerHaptic(type = 'light') {
    try {
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    } catch (e) {
      // Ignored if outside Telegram
    }
  }

  // =========================================================================
  // 6. Pyodide Engine Initialization & Synchronous Input Bridge
  // =========================================================================
  window.handlePythonInput = function (promptText) {
    const p = promptText ? String(promptText) : '';
    if (p) {
      appendOutput(p, 'out-stdout');
    }
    const displayPrompt = p.trim() ? p.trim() : 'Python input required:';
    const val = window.prompt(displayPrompt);
    const result = val !== null ? String(val) : '';
    appendOutput(result + '\n', 'out-prompt');
    return result;
  };

  async function initPyodide() {
    try {
      DOM.engineStatusText.textContent = 'Downloading Python Engine...';
      
      pyodideInstance = await loadPyodide({
        stdout: (text) => appendOutput(text + '\n', 'out-stdout'),
        stderr: (text) => appendOutput(text + '\n', 'out-stderr'),
      });

      // Patch Python builtins.input with direct synchronous JS bridge
      await pyodideInstance.runPythonAsync(`
import builtins
import js

def _sync_input(prompt=""):
    p = str(prompt) if prompt is not None else ""
    return str(js.handlePythonInput(p))

builtins.input = _sync_input
`);

      isPyodideReady = true;
      DOM.engineStatusText.textContent = 'Python 3.12 Ready';
      DOM.pulseDot.classList.add('ready');
      DOM.btnRun.classList.remove('running');
    } catch (err) {
      console.error('Failed to load Pyodide:', err);
      DOM.engineStatusText.textContent = 'Engine Error';
      DOM.pulseDot.style.background = 'var(--accent-error)';
      appendOutput(`\n❌ Failed to load WebAssembly Python: ${err.message}\n`, 'out-stderr');
    }
  }

  // =========================================================================
  // 7. Output Terminal Helpers
  // =========================================================================
  function clearOutput() {
    DOM.terminalOutput.innerHTML = '';
    DOM.execTimeBadge.classList.add('hidden');
  }

  function appendOutput(text, className = 'out-stdout') {
    const welcome = DOM.terminalOutput.querySelector('.terminal-welcome');
    if (welcome) {
      welcome.remove();
    }

    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    DOM.terminalOutput.appendChild(span);
    DOM.terminalOutput.scrollTop = DOM.terminalOutput.scrollHeight;
  }

  // =========================================================================
  // 8. Code Execution Logic
  // =========================================================================
  async function runCode() {
    triggerHaptic('medium');

    if (!isPyodideReady || !pyodideInstance) {
      showToast('⏳ Python engine is still initializing. Please wait...');
      return;
    }

    if (isExecuting) {
      showToast('⚠️ A program is already running.');
      return;
    }

    const code = editor.getValue().trim();
    if (!code) {
      showToast('💡 Please write some code first!');
      return;
    }

    clearOutput();
    isExecuting = true;
    DOM.btnRun.classList.add('running');
    DOM.btnRun.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Running...</span>';

    const startTime = performance.now();

    try {
      // Execute asynchronously to support custom async input() and top-level await
      await pyodideInstance.runPythonAsync(code);

      const duration = Math.round(performance.now() - startTime);
      DOM.execTimeText.textContent = `${duration}ms`;
      DOM.execTimeBadge.classList.remove('hidden');

      if (!DOM.terminalOutput.textContent.trim()) {
        appendOutput('✅ Program finished with no output.\n', 'out-success');
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      DOM.execTimeText.textContent = `${duration}ms`;
      DOM.execTimeBadge.classList.remove('hidden');

      appendOutput(`\n${err}\n`, 'out-stderr');
    } finally {
      isExecuting = false;
      DOM.btnRun.classList.remove('running');
      DOM.btnRun.innerHTML = '<i class="fa-solid fa-play"></i> <span>Run</span>';
    }
  }

  // =========================================================================
  // 9. UI Actions & Event Listeners
  // =========================================================================
  DOM.btnRun.addEventListener('click', runCode);

  // Snippet Template Selection
  DOM.snippetSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    if (SNIPPETS[key]) {
      editor.setValue(SNIPPETS[key]);
      triggerHaptic('light');
      showToast(`Loaded '${e.target.options[e.target.selectedIndex].text}'`);
    }
    e.target.value = '';
  });

  // Font Size Adjustment
  DOM.btnFontInc.addEventListener('click', () => {
    if (editorFontSize < 22) {
      editorFontSize += 1.5;
      DOM.editorContainer.querySelector('.CodeMirror').style.fontSize = `${editorFontSize}px`;
      editor.refresh();
    }
  });

  DOM.btnFontDec.addEventListener('click', () => {
    if (editorFontSize > 10) {
      editorFontSize -= 1.5;
      DOM.editorContainer.querySelector('.CodeMirror').style.fontSize = `${editorFontSize}px`;
      editor.refresh();
    }
  });

  // Copy Code
  DOM.btnCopyCode.addEventListener('click', async () => {
    triggerHaptic('light');
    try {
      await navigator.clipboard.writeText(editor.getValue());
      showToast('📋 Code copied to clipboard!');
    } catch (e) {
      showToast('❌ Failed to copy code.');
    }
  });

  // Clear Code
  DOM.btnClearCode.addEventListener('click', () => {
    triggerHaptic('light');
    if (confirm('Clear the current code in editor?')) {
      editor.setValue('');
      editor.focus();
      showToast('🗑️ Editor cleared');
    }
  });

  // Copy Terminal Output
  DOM.btnCopyOutput.addEventListener('click', async () => {
    triggerHaptic('light');
    const text = DOM.terminalOutput.innerText;
    if (!text.trim()) {
      showToast('ℹ️ No output to copy.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('📋 Console output copied!');
    } catch (e) {
      showToast('❌ Failed to copy output.');
    }
  });

  // Clear Terminal Output
  DOM.btnClearOutput.addEventListener('click', () => {
    triggerHaptic('light');
    clearOutput();
    appendOutput('Console cleared.\n', 'out-info');
  });

  // Mobile Quick Virtual Symbols Bar
  DOM.quickSymbols.addEventListener('click', (e) => {
    const btn = e.target.closest('.sym-btn');
    if (!btn) return;
    triggerHaptic('light');
    const insertText = btn.dataset.insert;
    if (insertText) {
      editor.replaceSelection(insertText, 'end');
      editor.focus();
    }
  });

  // =========================================================================
  // Send Code to Telegram Bot
  // =========================================================================
  const DEFAULT_BOT_TOKEN = '8762281889:AAGSH5DtvALYnz6_X7vdyZE2EKbrYQXdMHM';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  DOM.btnSendBot.addEventListener('click', async () => {
    triggerHaptic('medium');
    const code = editor.getValue().trim();
    if (!code) {
      showToast('⚠️ No code to send.');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || DEFAULT_BOT_TOKEN;
    const chatId = urlParams.get('chat_id') || urlParams.get('user_id') || (window.Telegram?.WebApp?.initDataUnsafe?.user?.id);

    // 1. Direct Telegram Bot API sendMessage if token and chat are present
    if (token && chatId) {
      DOM.btnSendBot.disabled = true;
      showToast('🚀 Sending code to Telegram...');
      try {
        const htmlText = `🐍 <b>Code from Python Console:</b>\n\n<pre><code class="language-python">${escapeHtml(code)}</code></pre>\n\n<i>To execute in chat, copy and send /run</i>`;
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: htmlText,
            parse_mode: 'HTML'
          })
        });
        const data = await res.json();
        if (data.ok) {
          showToast('✅ Code sent to your Telegram chat!');
          if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          }
          DOM.btnSendBot.disabled = false;
          return;
        } else {
          console.warn('Telegram API response error:', data);
          showToast(`⚠️ Telegram: ${data.description || 'Could not deliver'}`);
        }
      } catch (err) {
        console.error('Direct sendMessage error:', err);
      } finally {
        DOM.btnSendBot.disabled = false;
      }
    }

    // 2. Try Telegram.WebApp.sendData (available if launched from reply keyboard)
    let sendDataSuccess = false;
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.sendData) {
      try {
        const payload = JSON.stringify({
          action: 'run_python',
          code: code,
          source: 'web_app'
        });
        window.Telegram.WebApp.sendData(payload);
        sendDataSuccess = true;
      } catch (err) {
        console.log('sendData not supported in this launch mode:', err);
      }
    }

    if (sendDataSuccess) {
      showToast('🚀 Sent code to Telegram Bot!');
      return;
    }

    // 3. Fallback: Telegram Share URL pre-filled with the code
    const shareText = encodeURIComponent('/run\n' + code);
    const shareUrl = `https://t.me/share/url?url=&text=${shareText}`;

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
      showToast('📋 Opening Telegram to send code...');
    } else {
      fallbackSend(code, shareUrl);
    }
  });

  function fallbackSend(code, shareUrl) {
    navigator.clipboard.writeText(code);
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    showToast('📋 Code copied! Ready to paste into Telegram.');
  }

  // Toast Notification System
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // =========================================================================
  // 11. Boot Application
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    initEditor();
    initPyodide();
  });

})();
