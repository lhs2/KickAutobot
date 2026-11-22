# Kick Timed Chat

Chrome extension that sends your own messages in a Kick chat on a timer, with templated text.

## Install
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Log in to kick.com, open a channel, and **reload the tab** once.
4. Click the extension icon, write your messages, set the interval, press **Start**.

## Personalization
One message per line. Available variables:

| Variable | Result |
|---|---|
| `{channel}` | channel name from the URL |
| `{time}` / `{date}` | local time (HH:MM) / date (YYYY-MM-DD) |
| `{n}` | number of messages sent this session |
| `{rand:a\|b\|c}` | one of the options, picked at random |

Example: `Hey {channel} chat! {rand:Enjoying the stream?|Drop a 🔥 if you're here} ({time})`

## Notes
- Minimum interval is 15 seconds. Respect each channel's slow mode and rules.
- The tab must stay open; sending stops if you navigate to another channel.
- If sending breaks after a Kick update, adjust `INPUT_SELECTORS` / `SEND_BUTTON_SELECTORS` at the top of `content.js`.
