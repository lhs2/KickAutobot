// Shared template engine (used by the content script and the popup preview).
//
// Variables:
//   {channel}          channel name from the URL
//   {time}             local time, HH:MM
//   {date}             local date, YYYY-MM-DD
//   {n}                how many messages have been sent this session (starting at 1)
//   {rand:a|b|c}       picks one option at random
//
// Example:
//   "Hey {channel} chat! {rand:Enjoying the stream?|Drop a 🔥 if you're here} ({time})"

function renderTemplate(template, ctx) {
  const pad = (v) => String(v).padStart(2, "0");
  const now = new Date();
  const vars = {
    channel: ctx.channel || "",
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    n: String(ctx.n ?? 1),
  };

  return template
    .replace(/\{rand:([^}]+)\}/g, (_, options) => {
      const list = options.split("|").map((s) => s.trim()).filter(Boolean);
      return list.length ? list[Math.floor(Math.random() * list.length)] : "";
    })
    .replace(/\{(channel|time|date|n)\}/g, (_, key) => vars[key])
    .trim();
}
