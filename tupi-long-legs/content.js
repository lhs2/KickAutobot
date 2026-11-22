(() => {
  if (window.__kickTimedChatLoaded) return;
  window.__kickTimedChatLoaded = true;

  const MIN_INTERVAL = 15; // seconds, hard floor

  let timer = null;
  let cfg = null;
  let startChannel = "";
  let index = 0;
  const state = { running: false, sent: 0, nextAt: null, lastError: null, lastMessage: null };

  const currentChannel = () => location.pathname.split("/").filter(Boolean)[0] || "";

  // Kick changes its DOM from time to time. If sending stops working, adjust these selectors.
  const INPUT_SELECTORS = [
    '[data-testid="chat-input"]',
    '#chat-input',
    '[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
  ];
  const SEND_BUTTON_SELECTORS = [
    '[data-testid="chat-send"]',
    'button[aria-label="Send"]',
    '#send-message-button',
  ];

  function findInput() {
    for (const sel of INPUT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function findSendButton() {
    for (const sel of SEND_BUTTON_SELECTORS) {
      const el = document.querySelector(sel);
      if (el && !el.disabled) return el;
    }
    return null;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function sendMessage(text) {
    const input = findInput();
    if (!input) throw new Error("Chat input not found (are you on a channel page and logged in?)");

    input.focus();
    // Clear anything already typed, then insert via execCommand so the editor's own handlers fire.
    document.execCommand("selectAll", false, null);
    document.execCommand("delete", false, null);
    document.execCommand("insertText", false, text);
    await sleep(150);

    const btn = findSendButton();
    if (btn) {
      btn.click();
    } else {
      const opts = { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true };
      input.dispatchEvent(new KeyboardEvent("keydown", opts));
      input.dispatchEvent(new KeyboardEvent("keyup", opts));
    }

    await sleep(500);
    if ((input.textContent || "").trim().length > 0) {
      throw new Error("Message did not send (slow mode, not logged in, or Kick's layout changed)");
    }
  }

  function nextTemplate() {
    const list = cfg.messages;
    if (cfg.order === "random") return list[Math.floor(Math.random() * list.length)];
    const t = list[index % list.length];
    index++;
    return t;
  }

  async function tick() {
    if (!state.running) return;

    if (currentChannel() !== startChannel) {
      stop("Channel changed, stopped.");
      return;
    }

    try {
      const text = renderTemplate(nextTemplate(), { channel: startChannel, n: state.sent + 1 });
      if (text) {
        await sendMessage(text);
        state.sent++;
        state.lastMessage = text;
        state.lastError = null;
      }
    } catch (err) {
      state.lastError = err.message;
    }

    if (cfg.max > 0 && state.sent >= cfg.max) {
      stop("Reached max messages.");
      return;
    }

    state.nextAt = Date.now() + cfg.interval * 1000;
    timer = setTimeout(tick, cfg.interval * 1000);
  }

  function start(newCfg) {
    stop();
    const messages = (newCfg.messages || []).map((m) => m.trim()).filter(Boolean);
    if (!messages.length) return { ok: false, error: "Add at least one message." };

    cfg = {
      messages,
      interval: Math.max(MIN_INTERVAL, Number(newCfg.interval) || 60),
      order: newCfg.order === "random" ? "random" : "sequential",
      max: Math.max(0, Number(newCfg.max) || 0),
    };
    startChannel = currentChannel();
    if (!startChannel) return { ok: false, error: "Open a Kick channel page first." };

    index = 0;
    state.running = true;
    state.sent = 0;
    state.lastError = null;
    state.lastMessage = null;
    tick();
    return { ok: true };
  }

  function stop(reason) {
    clearTimeout(timer);
    timer = null;
    state.running = false;
    state.nextAt = null;
    if (reason) state.lastError = reason;
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "start") sendResponse(start(msg.cfg));
    else if (msg.type === "stop") { stop(); sendResponse({ ok: true }); }
    else if (msg.type === "status") sendResponse({ ok: true, state, channel: currentChannel() });
    return true;
  });
})();
