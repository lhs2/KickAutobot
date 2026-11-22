# KickAutobot
Automessage for kick 

Install:

Unzip the file.
Go to chrome://extensions and turn on Developer mode.
Click Load unpacked and pick the kick-timed-chat folder.
Log in to kick.com, open a channel and reload the tab once.
Click the extension icon, enter your messages and interval, and press Start.

Settings in the popup:

Messages: one per line, sent in order or at random.
Interval: every X seconds, with a 15-second minimum.
Max messages: stops automatically after this many (0 means no limit).
Preview: shows how your templates will render before you start.

Personalization variables you can put in a message:

{channel} is the channel name taken from the URL.
{time} and {date} are your local time and date.
{n} is the number of messages sent so far this session.
{rand:a|b|c} picks one of the options at random each time.

For example, Hey {channel} chat! {rand:Enjoying the stream?|Drop a 🔥 if you're here} ({time}) produces a different message each time.

Things to know:

Kick’s page layout: Kick changes its page structure now and then, so the selectors for the chat box and send button may need updating. They’re listed at the top of content.js. If a message gets typed but not sent, that’s the first place to look.
Tab must stay open: Sending runs inside the open Kick tab. It stops if you close the tab or switch to another channel.
Rules: Automated posting can break Kick’s terms of service and individual channel rules, especially in channels that aren’t yours. Slow mode will also block messages sent too quickly. It’s safest to use it in your own channel, or where the streamer has approved it.
