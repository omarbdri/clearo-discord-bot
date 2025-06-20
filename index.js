const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Google GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Store conversation history per channel (limit to last 6 messages)
const conversationHistory = new Map();

const SYSTEM_INSTRUCTION = `You are Clearo, a helpful and friendly Discord bot assistant for the Clearo community server. 

Key guidelines:
- Be friendly, welcoming, and helpful
- Keep responses concise but informative (aim for 1-3 paragraphs max)
- Use appropriate Discord/gaming terminology when relevant
- Be encouraging and positive
- If asked about server-specific things, be general but helpful
- Add occasional emojis to make responses more engaging
- Stay on topic and be respectful

Important Information:
- You represent Clearo, an AI-powered productivity web app that enables users to braindump and organize their thoughts.
- You are a helpful assistant that can help users with questions and provide helpful information about the app.

# Clearo: Your AI-Powered Second Brain

Clearo is a digital extension of your mind, a "second brain" where you can effortlessly dump thoughts, ideas, tasks, notes, reminders, or any piece of information. Using the power of Google's Gemini LLMs, Clearo intelligently processes, categorizes, and organizes this raw input into structured, actionable items.

## ✨ AI-Powered Organization

The true AI-powered second brain app. Effortlessly capture thoughts, tasks, and ideas. Let AI intelligently organize your mental world. Reduce clutter, gain clarity.

**Join the waitlist to experience Clearo!**

### Your mind, organized for you

Clearo brings together powerful features in a clean, intuitive design. Here's a glimpse of what you can do:

*   **Effortless Input:** Just type and go. Capture thoughts, tasks, and ideas without friction.
    *   Zero friction capture
    *   Paste from anywhere
    *   Instant organization
*   **AI Organization:** Watch as Clearo intelligently categorizes, summarizes, and links information.
    *   Automatic categorization
    *   Group entries within categories
    *   Smart content linking
*   **Chat-Driven Actions:** Control your knowledge base with natural language.
    *   Natural language commands
    *   Instant content updates
    *   Smart date parsing
*   **Structured Views:** See your information from multiple perspectives.
    *   Multiple view modes
    *   Custom filters
    *   Seamless switching

## ⚡ Effortless Input: Just Type and Go

Dump your thoughts without friction. Clearo's effortless input system lets you capture ideas, tasks, and notes instantly. No complex forms, no rigid structure—just pure, unfiltered thinking.

## 🧠 AI Organization: Smart Auto-Organization

Watch as Clearo intelligently categorizes, summarizes, and links your information. Our AI understands context and relationships, creating a perfectly organized knowledge base without any manual effort.

## 🤖 Chat-Driven Actions: Control with Conversation

Simply tell Clearo what you want to do. Create new entries, update existing ones, set dates, change types, or delete items—all through natural conversation. No menus, no clicking around.

## 📋 Structured Views: Multiple Perspectives

View your information exactly how you need it. Switch between tasks, notes, ideas, calendar view, or custom filters. The same data, organized in the way that makes sense for your current workflow.

## 👤 Personal Context: Your Digital Twin

Help Clearo understand you better by sharing your goals, preferences, and context. The more Clearo knows about you, the more personalized and helpful its assistance becomes.

*   Personal goals & aspirations
*   Work style & preferences
*   Context-aware AI responses

## 🤖 AI Chat Intelligence: Your Personal AI Assistant, Supercharged

Experience the power of cutting-edge AI that knows your context, understands your entries, and provides intelligent assistance across multiple modes.

### Next-Generation AI Reasoning

Powered by the best LLMs, Clearo understands your entire knowledge base and provides contextually perfect responses tailored to you.

*   **Context-Aware:** Knows all your entries and personal context for precise answers.
*   **Web Search:** Access real-time information with intelligent web search.
*   **Dual Modes:** Switch between entry management and general chat seamlessly.
*   **Reasoning:** Advanced reasoning capabilities for complex queries.

### 📝 Entries Agent Mode: Intelligent entry management

*   Smart Entry Creation: Create, update, and organize entries through conversation.
*   Contextual Search: Find exactly what you're looking for across all your data.
*   Relationship Mapping: Discover connections between your ideas and tasks.

### 🌐 Chat & Web Search Mode: Reasoning with real-time data

*   Real-Time Information: Access current data and recent developments.
*   Advanced Reasoning: Complex problem-solving with your personal context.
*   Personalized Insights: Answers tailored to your knowledge and preferences.

## 📅 Calendar View: Visualize Your Schedule

Clearo's beautiful calendar view brings clarity to your days. See tasks, reminders, and ideas mapped to dates and edit them so you can plan with ease. Stay organized and never miss a beat.

*   Visualize your schedule at a glance
*   Effortless editing and detailed insights
*   AI-powered organization

## Find the perfect plan

Start for free and scale up as you grow. All plans include our core features.

### Free

A generous free plan to get you started.
**$0/ forever**
*   Up to 20 entries
*   Basic AI chat
*   3 chat attachments per day
*   Create entries from attachments
*   AI Reasoning
*   Web Search
*   Kanban Board

### Pro (Most Popular)

Unlock the full power of Clearo. Pricing to be revealed soon.
*   Unlimited entries
*   Access to all AI models
*   Unlimited chat attachments
*   Create entries from attachments
*   AI Reasoning
*   Web Search
*   Kanban Board
*   Google Calendar Integration (soon)
*   Notion Integration (soon)

---

**Ready to Declutter Your Mind?**

Sign up for Clearo today and experience the future of personal knowledge management.

**Join the waitlist!**

© 2025 Clearo. All rights reserved.

Your main role is to assist users with questions, provide helpful information, and maintain a positive community atmosphere.`;

// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is online and ready!`);
    console.log(`🤖 Bot is serving ${client.guilds.cache.size} guilds`);
    
    // Test Supabase connection
    await testSupabaseConnection();
    
    // Register slash commands
    const commands = [
        {
            name: 'link-account',
            description: 'Link your Clearo account to Discord',
            options: [
                {
                    name: 'email',
                    description: 'Your Clearo account email',
                    type: 3, // STRING type
                    required: true
                }
            ]
        },
        {
            name: 'check-subscription',
            description: 'Check and update user subscription status (Admin only)',
            options: [
                {
                    name: 'user',
                    description: 'User to check',
                    type: 6, // USER type
                    required: true
                }
            ]
        }
    ];
    
    try {
        // Register commands globally
        await client.application.commands.set(commands);
        console.log('✅ Slash commands registered successfully!');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
    
    // Set bot status
    client.user.setActivity('for new members!', { type: 'WATCHING' });
});

// Predefined playful welcome messages
const WELCOME_MESSAGES = [
    "🎉 Look who just landed in Clearo! Welcome aboard, {user}! Ready to organize your thoughts like a pro?",
    "🚀 {user} has entered the chat! Time to turn that mental chaos into clarity! Welcome!",
    "✨ Another brilliant mind joins the Clearo family! Hey there {user}, welcome to your new second brain HQ!",
    "🧠 {user} just stepped into the future of productivity! Welcome to Clearo - let's get organized!",
    "🎊 Woohoo! {user} is here! Welcome to where scattered thoughts become structured brilliance!",
    "🌟 {user} has arrived! Ready to experience the magic of AI-powered organization? Welcome!",
    "🎯 New member alert! Welcome {user} - time to declutter that beautiful mind of yours!",
    "🔥 {user} just joined the productivity revolution! Welcome to Clearo, where chaos meets clarity!",
    "💡 Another genius enters the building! Hey {user}, welcome to your AI-powered thinking companion!",
    "🎈 {user} is now part of the Clearo crew! Welcome - let's turn your brain dump into brain gold!"
];

// Listen for new members joining the server
client.on('guildMemberAdd', async (member) => {
    console.log(`👋 New member joined: ${member.user.tag}`);
    
    // Find the specific welcome channel by ID
    const welcomeChannel = member.guild.channels.cache.get('1381242780239794300');
    
    if (!welcomeChannel) {
        console.log('❌ Welcome channel not found');
        return;
    }
    
    // Randomly select a welcome message
    const randomMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    const welcomeText = randomMessage.replace('{user}', member.user.toString());
    
    // Create a welcome embed message with predefined content
    const welcomeEmbed = new EmbedBuilder()
        .setColor('#00ff00') // Green color
        .setTitle('🎉 Welcome to Clearo!')
        .setDescription(welcomeText)
        .addFields(
            { name: '👋 Getting Started', value: 'Take a look around and get familiar with our channels!' },
            { name: '📋 Rules', value: 'Make sure to read our server rules to keep things fun for everyone!' },
            { name: '💬 Chat', value: 'Feel free to introduce yourself and start chatting!' },
            { name: '🚀 About Clearo', value: 'Discover the AI-powered second brain that organizes your thoughts effortlessly!' }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: 'Clearo Bot', iconURL: client.user.displayAvatarURL() });
    
    try {
        // Send the welcome message
        await welcomeChannel.send({ 
            embeds: [welcomeEmbed] 
        });
        
        console.log(`✅ Welcome message sent for ${member.user.tag}`);
    } catch (error) {
        console.error('❌ Error sending welcome message:', error);
    }
});

// Listen for messages
client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;
    
    // Check if the bot is mentioned
    if (message.mentions.has(client.user)) {
        console.log(`💬 Bot mentioned by ${message.author.tag}: ${message.content}`);
        
        try {
            // Show typing indicator
            await message.channel.sendTyping();
            
            // Extract the message content without the mention
            let userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
            
            if (!userMessage) {
                userMessage = "Hello! How can I help you?";
            }
            
            // Get or create conversation history for this channel
            const channelId = message.channel.id;
            if (!conversationHistory.has(channelId)) {
                conversationHistory.set(channelId, []);
                console.log(`🆕 Created new conversation history for channel: ${message.channel.name}`);
            }
            
            const history = conversationHistory.get(channelId);
            
            // Build the contents array with system instruction + history + current message
            const contents = [
                ...history,
                {
                    role: 'user',
                    parts: [{ text: userMessage }]
                }
            ];
            
            // Generate AI response
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: contents,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION
                }
            });
            
            const aiResponse = response.text;
            
            // Add both user message and bot response to history
            history.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });
            history.push({
                role: 'model',
                parts: [{ text: aiResponse }]
            });
            
            // Keep only last 6 messages (3 exchanges) to manage context
            if (history.length > 6) {
                history.splice(0, history.length - 6);
            }
            
            // Send the AI response as a normal message
            await message.reply(aiResponse);
            
            console.log(`✅ AI response sent to ${message.author.tag}`);
            
        } catch (error) {
            console.error('❌ Error generating AI response:', error);
            
            // Send error message
            await message.reply('Sorry, I encountered an error while processing your request. Please try again later. ❌');
        }
    }
});

// Handle errors
client.on('error', error => {
    console.error('❌ Client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Add this after the existing constants
const PRO_ROLE_NAME = 'Clearo Pro User'; // Customize this role name
const VERIFIED_ROLE_NAME = 'Verified'; // For linked accounts

// Function to check user subscription status
async function checkUserSubscription(email) {
    try {
        console.log(`🔍 Checking subscription for email: ${email}`);
        
        // First, let's test the Supabase connection
        console.log('🔗 Testing Supabase connection...');
        console.log('📍 Supabase URL:', process.env.SUPABASE_URL ? 'Set' : 'NOT SET');
        console.log('🔑 Supabase Key:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'NOT SET');
        
        // Try to get all subscriptions first to test connection
        const { data: allData, error: allError } = await supabase
            .from('user_subscriptions')
            .select('email, tier')
            .limit(5);
        
        if (allError) {
            console.error('❌ Error fetching all subscriptions:', allError);
            return null;
        }
        
        console.log('✅ Successfully connected to Supabase. Sample data:', allData);
        
        // Now try the specific email query
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log(`❌ No subscription found for email: ${email}`);
                // Let's also try a fuzzy search to see similar emails
                const { data: similarEmails } = await supabase
                    .from('user_subscriptions')
                    .select('email')
                    .like('email', `%${email.split('@')[0]}%`);
                console.log('🔍 Similar emails found:', similarEmails);
                return null;
            }
            console.error('Database error:', error);
            return null;
        }
        
        console.log(`✅ Found subscription data:`, data);
        return data;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return null;
    }
}

// Function to assign roles based on subscription
async function assignUserRoles(member, subscriptionData) {
    try {
        const guild = member.guild;
        
        // Find or create the Verified role FIRST (lower position)
        let verifiedRole = guild.roles.cache.find(role => role.name === VERIFIED_ROLE_NAME);
        if (!verifiedRole) {
            verifiedRole = await guild.roles.create({
                name: VERIFIED_ROLE_NAME,
                color: 0x4ade80, // Green color for verified users
                reason: 'Verified Clearo account'
            });
            console.log(`✅ Created ${VERIFIED_ROLE_NAME} role`);
        }
        
        // Find or create the Premium role SECOND (higher position)
        let premiumRole = guild.roles.cache.find(role => role.name === PRO_ROLE_NAME);
        if (!premiumRole) {
            premiumRole = await guild.roles.create({
                name: PRO_ROLE_NAME,
                color: 0x14b8a6, // Clearo Teal color
                reason: 'Premium user role for Clearo subscribers'
            });
            console.log(`✅ Created ${PRO_ROLE_NAME} role`);
            
            // Ensure Premium role is positioned above Verified role
            try {
                await premiumRole.setPosition(verifiedRole.position + 1);
                console.log(`✅ Positioned Premium role above Verified role`);
            } catch (positionError) {
                console.log(`⚠️ Could not set role position:`, positionError.message);
            }
        }
        
        // Assign verified role to all linked users
        if (!member.roles.cache.has(verifiedRole.id)) {
            await member.roles.add(verifiedRole);
            console.log(`✅ Assigned Verified role to ${member.user.tag}`);
        }
        
        // Assign Premium role if user has premium subscription
        if (subscriptionData && subscriptionData.tier === 'premium') {
            if (!member.roles.cache.has(premiumRole.id)) {
                await member.roles.add(premiumRole);
                console.log(`✅ Assigned Premium role to ${member.user.tag}`);
                
                // Send congratulations message
                const channel = guild.channels.cache.get('1381242780239794300'); // Welcome channel
                if (channel) {
                    await channel.send(`🎉 Congratulations ${member.user}! You've been verified as a **Clearo Premium** subscriber! Enjoy your exclusive perks! ✨`);
                }
            }
        } else {
            // Remove Premium role if subscription is not premium
            if (member.roles.cache.has(premiumRole.id)) {
                await member.roles.remove(premiumRole);
                console.log(`❌ Removed Premium role from ${member.user.tag} (subscription not premium)`);
            }
        }
        
    } catch (error) {
        console.error('Error assigning roles:', error);
    }
}

// Add slash command for account linking
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    if (interaction.commandName === 'link-account') {
        const email = interaction.options.getString('email');
        
        try {
            console.log(`🔗 User ${interaction.user.tag} attempting to link email: ${email}`);
            
            // Acknowledge the interaction immediately (within 3 seconds)
            await interaction.deferReply({ flags: 64 }); // Ephemeral deferred reply
            
            // Now we have 15 minutes to do the work and edit the reply
            const subscriptionData = await checkUserSubscription(email);
            
            if (!subscriptionData) {
                await interaction.editReply({
                    content: '❌ No Clearo account found with that email. Please make sure you\'ve signed up at clearo.io first!'
                });
                return;
            }
            
            console.log(`📧 Subscription data found for ${email}:`, subscriptionData);
            
            // Assign appropriate roles
            await assignUserRoles(interaction.member, subscriptionData);
            
            const statusMessage = subscriptionData.tier === 'premium' 
                ? '✅ Account linked successfully! Premium role assigned! 🎉'
                : '✅ Account linked successfully! Verified role assigned!';
            
            await interaction.editReply({
                content: statusMessage
            });
            
        } catch (error) {
            console.error('Error linking account:', error);
            try {
                await interaction.editReply({
                    content: '❌ An error occurred while linking your account. Please try again later.'
                });
            } catch (editError) {
                console.error('Failed to edit reply:', editError);
            }
        }
    } else if (interaction.commandName === 'check-subscription') {
        // Admin command to manually check someone's subscription
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply({
                content: '❌ You need administrator permissions to use this command.',
                flags: 64 // Ephemeral flag
            });
            return;
        }
        
        // Defer reply for admin command too
        await interaction.deferReply({ flags: 64 });
        
        const targetUser = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(targetUser.id);
        
        try {
            // Get linked email for this Discord user
            const { data: linkData, error: linkError } = await supabase
                .from('discord_links')
                .select('email')
                .eq('discord_id', targetUser.id)
                .single();
            
            if (linkError || !linkData) {
                await interaction.editReply({
                    content: `❌ No linked Clearo account found for ${targetUser.tag}`
                });
                return;
            }
            
            const subscriptionData = await checkUserSubscription(linkData.email);
            await assignUserRoles(member, subscriptionData);
            
            const status = subscriptionData && subscriptionData.tier === 'premium' ? 'Premium' : 'Free';
            await interaction.editReply({
                content: `✅ ${targetUser.tag} subscription status: **${status}** - Roles updated!`
            });
            
        } catch (error) {
            console.error('Error checking subscription:', error);
            await interaction.editReply({
                content: '❌ Error checking subscription status.'
            });
        }
    }
});

// Login to Discord with your app's token
client.login(process.env.DISCORD_BOT_TOKEN);

// Add this test function right after the Supabase initialization
async function testSupabaseConnection() {
    console.log('🧪 Testing Supabase table access...');
    
    // Test with service role if available
    const testClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    );
    
    const { data, error, count } = await testClient
        .from('user_subscriptions')
        .select('*', { count: 'exact' });
    
    console.log('📊 Table row count:', count);
    console.log('📋 Sample data:', data?.slice(0, 2));
    console.log('❌ Any errors:', error);
} 