# Alpha Sector Duo Cup bot

Handles registration for the tournament end to end: a Register button posts a
modal, the player DMs the bot their ELO screenshot, the bot assigns
Registered or Standby automatically based on the 16-slot cap, and (if you
set it up) logs every entry to a Google Sheet your helper can see.

Screenshots are collected by DM rather than a private thread, because
private threads need server boost level 2. DMs work regardless of boost
level and keep each submission private by default.

## 1. Create the bot application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Under **Bot**, click "Add Bot". Copy the token, this is your `DISCORD_TOKEN`. Keep it secret, anyone with it controls your bot.
3. Still under **Bot**, enable these under Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
4. Under **OAuth2 > URL Generator**, check scopes `bot` and `applications.commands`, and under bot permissions check: Send Messages, Embed Links, Manage Roles, Read Message History, Use Slash Commands. Open the generated URL and invite the bot to Alpha Sector.
5. **Important:** in Server Settings > Roles, drag the bot's own role above both Registered and Standby. A bot can only assign roles that sit below its own role.

## 2. Collect your IDs

Enable Developer Mode (User Settings > Advanced), then right click to copy:
- The server itself → `GUILD_ID`
- `#registration` → `REGISTRATION_CHANNEL_ID`
- Your private admin log channel → `ADMIN_LOG_CHANNEL_ID`
- The Registered role → `REGISTERED_ROLE_ID`
- The Standby role → `STANDBY_ROLE_ID`

Your application's Client ID is on the General Information page of the Developer Portal → `CLIENT_ID`.

## 3. Configure

```
cp .env.example .env
```

Fill in every value from steps 1 and 2. Leave the three `GOOGLE_*` values blank for now, you can add Sheets logging later without changing any code.

## 4. Install and register the slash command

```
npm install
npm run deploy-commands
```

You only need to re-run `deploy-commands` if you change the command itself.

## 5. Run it

```
npm start
```

This works for testing locally, but your laptop going to sleep takes the bot offline. For the actual tournament you want it always on:

- **Railway or Render** (free tier is enough for a bot this size): push this folder to a GitHub repo, connect it, set the same environment variables in their dashboard, set the start command to `npm start`.
- **A small VPS**, if you'd rather run it yourself: install Node, `pm2 start src/index.js` keeps it running and restarts it if it crashes.

Shared hosting (the kind most web hosts, Hostinger included, sell for websites) generally can't run a persistent background process like this, it's built for request/response PHP, not a long-running bot connection.

## 6. Go live

In `#registration`, run `/post-registration` once. That posts the embed with the Register button. Don't run it again unless you want a duplicate post, delete the old message first if you need to repost.

## Optional: Google Sheets logging

Without this, every registration still lands in `data/registrations.json` on whatever machine runs the bot. Sheets logging gives you and your helper a live, shareable view instead.

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project, enable the **Google Sheets API**.
2. Create a service account, then a key for it (JSON). Open the JSON file: you need the `client_email` and `private_key` fields.
3. Create your tracker Google Sheet with this header row, matching the Helper Guide doc:

   `Timestamp | Discord username | Brawlhalla ID | Platform | Steam profile link | Claimed ELO | Screenshot link | Status | Verified by | Payment status`

4. Share that Sheet with the service account's email (the `client_email` value) as an Editor.
5. In `.env`:
   - `GOOGLE_SHEETS_ID` is the long ID in the Sheet's URL, between `/d/` and `/edit`.
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` is `client_email` from the JSON key.
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` is `private_key` from the JSON key, pasted as one line (the literal `\n` characters in it are fine, the bot converts them back to real newlines).
6. Restart the bot. New registrations now append as rows automatically.

## Testing on the live bot

You don't need to run this locally to test it. Deploy it (step 5), run `/post-registration`, then register as yourself like any normal player, screenshot included. Once you've confirmed the role and the confirmation DM look right:

```
/unregister @yourself
```

This strips your Registered or Standby role and deletes your entry from `data/registrations.json`, so your test run doesn't count toward the 16 slots or show up as a real entrant. It's admin-only (`ManageGuild`), same as `/post-registration`. If you had Google Sheets logging on during the test, delete that row by hand too, the command only clears Discord and the local file. Keep `/unregister` around after launch as well, it's the same cleanup you'll want for a real withdrawal or a disqualified entry.

## How it works

1. Admin runs `/post-registration` in `#registration`, which posts the embed and the Register button (`src/interactions/postRegistrationCommand.js`).
2. A player clicks Register, a modal collects their Brawlhalla ID, platform, and Steam link (`registerButton.js`).
3. On submit, the bot saves a `pending` entry and DMs the player asking for a screenshot (`registerModal.js`).
4. The player replies in DM with an image. The bot checks how many players are already `registered`, assigns `registered` or `standby`, assigns the matching Discord role, appends a row to the Sheet if configured, replies with a confirmation, and posts a summary (with the screenshot) to the admin log channel (`dmScreenshot.js`).

All state lives in `data/registrations.json`. Back it up before any bot redeploys that might wipe the filesystem (Railway and Render both do this on redeploy unless you attach a persistent volume, Sheets logging is the safer long-term record).
