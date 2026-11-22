const $ = (id) => document.getElementById(id);
const fields = ["messages", "interval", "max", "order"];
let running = false;

function readCfg() {
  return {
    messages: $("messages").value.split("\n"),
    interval: Number($("interval").value),
    max: Number($("max").value),
    order: $("order").value,
  };
}

async function save() {
  await chrome.storage.local.set({ cfg: readCfg() });
}

async function load() {
  const { cfg } = await chrome.storage.local.get("cfg");
  if (!cfg) return;
  $("messages").value = (cfg.messages || []).join("\n");
  $("interval").value = cfg.interval || 60;
  $("max").value = cfg.max || 0;
  $("order").value = cfg.order || "sequential";
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function send(msg) {
  const tab = await activeTab();
  if (!tab || !/^https:\/\/kick\.com\//.test(tab.url || "")) {
    return { ok: false, error: "Open a kick.com channel tab first." };
  }
  try {
    return await chrome.tabs.sendMessage(tab.id, msg);
  } catch {
    return { ok: false, error: "Reload the Kick tab, then try again." };
  }
}

function setStatus(text, isErr) {
  $("status").textContent = text;
  $("status").classList.toggle("err", !!isErr);
}

async function refresh() {
  const res = await send({ type: "status" });
  if (!res.ok) { setStatus(res.error, true); return; }
  const s = res.state;
  running = s.running;
  $("toggle").textContent = running ? "Stop" : "Start";
  $("toggle").classList.toggle("running", running);

  const lines = [];
  lines.push(running ? `Running on #${res.channel}` : "Idle");
  lines.push(`Sent: ${s.sent}`);
  if (running && s.nextAt) lines.push(`Next in ${Math.max(0, Math.round((s.nextAt - Date.now()) / 1000))}s`);
  if (s.lastMessage) lines.push(`Last: ${s.lastMessage}`);
  if (s.lastError) lines.push(`⚠ ${s.lastError}`);
  setStatus(lines.join("\n"), !!s.lastError);
}

$("toggle").addEventListener("click", async () => {
  await save();
  const res = running ? await send({ type: "stop" }) : await send({ type: "start", cfg: readCfg() });
  if (!res.ok) setStatus(res.error, true);
  else refresh();
});

$("previewBtn").addEventListener("click", async () => {
  const tab = await activeTab();
  let channel = "yourchannel";
  try { channel = new URL(tab.url).pathname.split("/").filter(Boolean)[0] || channel; } catch {}
  const lines = readCfg().messages.map((m) => m.trim()).filter(Boolean);
  $("preview").textContent = lines.length
    ? lines.map((m, i) => renderTemplate(m, { channel, n: i + 1 })).join("\n")
    : "Nothing to preview.";
});

fields.forEach((f) => $(f).addEventListener("change", save));

load().then(refresh);
setInterval(refresh, 1000);
