# Clearo Discord Bot 🤖

A friendly Discord bot for the Clearo server that welcomes new users with beautiful embed messages.

## Features ✨

- **Welcome Messages**: Automatically welcomes new members with a beautiful embed message
- **Smart Channel Detection**: Finds welcome channels automatically (looks for 'welcome', 'general', or 'welcomes')
- **User Avatars**: Displays the new member's avatar in the welcome message
- **Error Handling**: Robust error handling with detailed logging
- **Status Activity**: Shows what the bot is doing

## Setup Instructions 🚀

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it "Clearo"
3. Go to the "Bot" section
4. Click "Add Bot"
5. Copy the bot token (you'll need this later)

### 2. Set Bot Permissions

In the "Bot" section, make sure these permissions are enabled:
- Send Messages
- Use Slash Commands
- Read Message History
- Add Reactions
- Use External Emojis

### 3. Invite Bot to Server

1. Go to the "OAuth2" > "URL Generator" section
2. Select "bot" scope
3. Select these permissions:
   - Send Messages
   - Read Message History
   - Add Reactions
   - Use External Emojis
4. Copy the generated URL and open it in your browser
5. Select your Clearo server and authorize the bot

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
```

Replace `your_bot_token_here` with the actual bot token from step 1.

### 6. Run the Bot

```bash
npm start
```

## Channel Setup 📋

The bot will automatically look for these channel names for welcome messages:
- `welcome`
- `general` 
- `welcomes`

Make sure you have at least one channel with one of these names, or the bot won't be able to send welcome messages.

## Customization 🎨

You can customize the bot by editing `index.js`:

- **Welcome Message**: Modify the `welcomeEmbed` in the `guildMemberAdd` event
- **Channel Names**: Change the channel detection logic
- **Bot Status**: Update the activity message in the `ready` event
- **Colors**: Change the embed color (currently green: `#00ff00`)

## Troubleshooting 🔧

### Bot Not Responding
- Make sure the bot token is correct in your `.env` file
- Check that the bot has proper permissions in your server
- Verify the bot is online in your server member list

### Welcome Messages Not Sending
- Ensure you have a channel named 'welcome', 'general', or 'welcomes'
- Check that the bot has permission to send messages in that channel
- Look at the console logs for error messages

### Permission Issues
- Make sure the bot role is above other roles it needs to interact with
- Verify the bot has "Send Messages" permission in the welcome channel

## Support 💬

If you encounter any issues, check the console logs for detailed error messages. The bot includes comprehensive logging to help diagnose problems.

## License 📄

ISC License 