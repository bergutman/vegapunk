import * as dotenv from 'dotenv'; dotenv.config();
import { Client, GatewayIntentBits, REST, Routes, Partials, ActivityType } from 'discord.js';
import * as vp from './vegapunk.js';

// Discord Slash Commands
const commands = [
    {
        name: 'chat',
        description: 'Chat with Vegapunk',
        options: [
            {
                name: "message",
                description: "Talk to Vegapunk",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'store',
        description: 'Store something with Vegapunk',
        options: [
            {
                name: "value",
                description: "Store something",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'forget',
        description: 'Forget something stored with Vegapunk',
        options: [
            {
                name: "value",
                description: "Remove a stored value",
                type: 3,
                required: true
            }
        ]
    },
    {

        name: 'ping',
        description: 'Check Websocket Heartbeat && Roundtrip Latency'
    }
];

// Initialize Discord Application Commands
async function initCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
    try {
        console.log('Started refreshing application commands (/)');
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands }).then(() => {
            console.log('Successfully reloaded application commands (/)');
        }).catch(e => console.log(e));
        console.log('Connecting to Discord Gateway...');

    } catch (error) {
        console.log(error);
    }
}

async function ping_Interaction_Handler(client, interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    interaction.editReply(`Websocket Heartbeat: ${interaction.client.ws.ping} ms. \nRoundtrip Latency: ${sent.createdTimestamp - interaction.createdTimestamp} ms`);
    client.user.setActivity('ping pong', ActivityType.Playing);
}

async function chat_Interaction_Handler(client, interaction) {
    const query = interaction.options._hoistedOptions[0].value;

    console.log("----------Channel Message--------");
    console.log("Date & Time : " + new Date());
    console.log("UserId      : " + interaction.user.id);
    console.log("User        : " + interaction.user.tag);
    console.log("Question    : " + query);

    try {
        await interaction.reply({ content: `<a:thinkingblob:1076976595073515592>` });
        vp.message(query, async (content) => {
            console.log("Response    : " + content.text);
            console.log("---------------End---------------");
            await interaction.editReply('```' + query + '```' + content.text);
            client.user.setActivity('messages', ActivityType.Listening);
        })
    } catch (e) {
        console.error(e);
    }
}

async function store_Interaction_Handler(client, interaction) {
    const storeval = interaction.options._hoistedOptions[0].value;
    console.log("----------Channel Message--------");
    console.log("Date & Time : " + new Date());
    console.log("UserId      : " + interaction.user.id);
    console.log("User        : " + interaction.user.tag);
    console.log("Store Value    : " + storeval);

    try {
        await interaction.reply({ content: `<a:thinkingblob:1076976595073515592>` });
        vp.store(storeval, async (content) => {
            console.log("Response    : " + content.text);
            console.log("---------------End---------------");
            await interaction.editReply('```' + storeval + '```' + ' will persist upon server reboots.');
            client.user.setActivity('messages', ActivityType.Listening);
        })
    } catch (e) {
        console.error(e);
    }

}

async function forget_Interaction_Handler(client, interaction) {
    const forgetval = interaction.options._hoistedOptions[0].value;
    console.log("----------Channel Message--------");
    console.log("Date & Time : " + new Date());
    console.log("UserId      : " + interaction.user.id);
    console.log("User        : " + interaction.user.tag);
    console.log("Store Value    : " + forgetval);

    try {
        await interaction.reply({ content: `<a:thinkingblob:1076976595073515592>` });
        vp.store(forgetval, interaction, async (content) => {
            console.log("Response    : " + content.text);
            console.log("---------------End---------------");
            await interaction.editReply('```' + forgetval + '```' + ' will no longer persist upon server reboots.');
            client.user.setActivity('messages', ActivityType.Listening);
        })
    } catch (e) {
        console.error(e);
    }

}

// Initialize Discord bot
async function init() {
    initCommands().catch(e => { console.log(e) });
    // Create client
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.MessageContent,
        ],
        partials: [Partials.Channel]
    });

    // Log client in
    client.login(process.env.DISCORD_BOT_TOKEN).catch(e => console.log(e));

    client.once('ready', () => {
        console.log(`Logged in as ${client.user.tag}`);
        console.log('Connected to Discord Gateway');
        console.log(new Date())
        client.user.setStatus('online');
        client.user.setActivity('messages', { type: ActivityType.Listening });
    });

    // Establish channel Message Handler
    client.on("interactionCreate", async interaction => {
        if (!interaction.isChatInputCommand()) return;

        client.user.setActivity(interaction.user.tag, { type: ActivityType.Listening });

        switch (interaction.commandName) {
            case "chat":
                chat_Interaction_Handler(client, interaction);
                break;
            case "store":
                store_Interaction_Handler(client, interaction);
                break;
            case "forget":
                forget_Interaction_Handler(client, interaction);
                break;
            case "ping":
                ping_Interaction_Handler(client, interaction);
                break;
            default:
                await interaction.reply({ content: 'Command Not Found' });
        }
    });
}

export { init };