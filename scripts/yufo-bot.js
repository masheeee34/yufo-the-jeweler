const { 
  Client, 
  GatewayIntentBits, 
  Partials,
  ChannelType,
  ActivityType, 
  SlashCommandBuilder, 
  REST, 
  Routes, 
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = '1551650954007548054';
const GUILD_ID = '1449069547876516106'; // Yufo The Jeweler
const CHECKOUT_CATEGORY_ID = '1461657414922277026'; // 🛒 CHECKOUT Category
const DB_PATH = path.join(__dirname, '../data/requests.json');

// Memory tracker to avoid repeating messages in Discord
const sentMessageIds = new Set();

function getRequests() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8') || '[]');
    }
  } catch (e) {
    console.error('Error reading requests DB:', e);
  }
  return [];
}

function saveRequests(items) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving requests DB:', e);
  }
}

async function createBot(withMessageContent = true) {
  const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ];

  if (withMessageContent) {
    intents.push(GatewayIntentBits.MessageContent);
  }

  const client = new Client({
    intents,
    partials: [Partials.Channel, Partials.Message]
  });

  client.once('clientReady', async () => {
    console.log(`[YUFO BOT] Connecte en tant que ${client.user.tag} (ID: ${client.user.id})`);
    client.user.setActivity('YUFO Atelier • Commandes Privées', { type: ActivityType.Watching });

    // Initialize existing message IDs into memory
    const existingReqs = getRequests();
    for (const req of existingReqs) {
      if (req.messages) {
        for (const m of req.messages) {
          sentMessageIds.add(m.id);
        }
      }
    }

    // Register Slash Commands
    try {
      const rest = new REST({ version: '10' }).setToken(TOKEN);
      const commands = [
        new SlashCommandBuilder()
          .setName('reply')
          .setDescription('Repondre au client dans ce salon de commande')
          .addStringOption(option =>
            option.setName('message')
              .setDescription('Texte de la reponse a transmettre au client sur le site')
              .setRequired(true)
          ),
        new SlashCommandBuilder()
          .setName('status')
          .setDescription('Mettre a jour le statut du dossier')
          .addStringOption(option =>
            option.setName('etat')
              .setDescription('Nouvel etat du dossier')
              .setRequired(true)
              .addChoices(
                { name: 'En attente', value: 'pending' },
                { name: 'Repondu', value: 'answered' },
                { name: 'Cloture', value: 'closed' }
              )
          )
      ];

      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log('[YUFO BOT] Slash commands (/reply, /status) enregistrees globalement');
    } catch (cmdErr) {
      console.error('[YUFO BOT] Erreur slash commands:', cmdErr.message);
    }

    // Start DB Watcher / Dispatch loop (every 3 seconds)
    setInterval(() => syncOrdersAndMessages(client), 3000);
  });

  // Handle Slash Commands
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'reply') {
      try {
        const text = interaction.options.getString('message');
        const channelId = interaction.channelId;

        const requests = getRequests();
        const request = requests.find(r => r.discordChannelId === channelId || r.discordThreadId === channelId);

        if (!request) {
          return interaction.reply({
            content: 'Aucun dossier de commande n\'est associe a ce salon.',
            ephemeral: true
          });
        }

        const newMsg = {
          id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          sender: 'admin',
          text,
          createdAt: new Date().toISOString()
        };

        request.messages = request.messages || [];
        request.messages.push(newMsg);
        request.status = 'answered';
        sentMessageIds.add(newMsg.id);

        saveRequests(requests);

        await interaction.reply({
          content: `**[Reponse Atelier transmise sur le site web]**\n${text}`
        });
      } catch (replyErr) {
        console.error('Erreur reply:', replyErr);
        interaction.reply({ content: `Erreur: ${replyErr.message}`, ephemeral: true });
      }
    }

    if (commandName === 'status') {
      try {
        const newStatus = interaction.options.getString('etat');
        const channelId = interaction.channelId;

        const requests = getRequests();
        const request = requests.find(r => r.discordChannelId === channelId || r.discordThreadId === channelId);

        if (!request) {
          return interaction.reply({
            content: 'Aucun dossier de commande n\'est associe a ce salon.',
            ephemeral: true
          });
        }

        request.status = newStatus;
        saveRequests(requests);

        const statusLabels = {
          pending: 'En attente',
          answered: 'Repondu',
          closed: 'Cloture'
        };

        await interaction.reply({
          content: `Statut de la commande **${request.id}** mis a jour : **${statusLabels[newStatus] || newStatus}**`
        });
      } catch (stErr) {
        console.error('Erreur status:', stErr);
        interaction.reply({ content: `Erreur: ${stErr.message}`, ephemeral: true });
      }
    }
  });

  // Handle direct text replies in private channels (when MessageContent intent is available)
  client.on('messageCreate', async (message) => {
    try {
      if (message.author.bot) return;

      const channelId = message.channel.id;
      const requests = getRequests();
      const request = requests.find(r => r.discordChannelId === channelId || r.discordThreadId === channelId);

      if (!request) return;

      const replyText = message.content ? message.content.trim() : '';
      if (!replyText) return;

      // Determine sender: if author is the buyer, sender is 'client', otherwise 'admin'
      const isClient = request.discordId && message.author.id === request.discordId;
      const sender = isClient ? 'client' : 'admin';

      const newMsg = {
        id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        sender,
        text: replyText,
        createdAt: new Date().toISOString()
      };

      request.messages = request.messages || [];
      request.messages.push(newMsg);
      if (sender === 'admin') {
        request.status = 'answered';
      }
      sentMessageIds.add(newMsg.id);

      saveRequests(requests);

      // React with confirmation checkmark
      await message.react('✅').catch(() => {});
    } catch (msgErr) {
      console.error('Erreur processing message:', msgErr);
    }
  });

  return client;
}

// Watch requests DB and handle automatic channel creation and website-to-discord messaging
async function syncOrdersAndMessages(client) {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    const requests = getRequests();
    let updated = false;

    for (const req of requests) {
      // 1. If request has NO private Discord channel yet -> Create dedicated private channel in 🛒 CHECKOUT!
      if (!req.discordChannelId) {
        try {
          const rawName = req.pseudo || 'client';
          const cleanName = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 20) || 'client';
          const channelName = `💎・${cleanName}`;

          const permissionOverwrites = [
            {
              id: guild.id, // @everyone denied
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: client.user.id, // Bot allowed
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ReadMessageHistory
              ]
            }
          ];

          // If client has a scraped Discord ID, grant them exclusive access!
          if (req.discordId) {
            permissionOverwrites.push({
              id: req.discordId,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.ReadMessageHistory
              ]
            });
          }

          // Create text channel in category CHECKOUT
          const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: CHECKOUT_CATEGORY_ID,
            topic: `Commande YUFO Atelier ${req.id} — Client Discord ID: ${req.discordId || 'N/A'}`,
            permissionOverwrites
          });

          console.log(`[YUFO BOT] Salon prive cree: #${channel.name} (${channel.id}) pour client ${req.pseudo}`);

          // Build Embed
          const firstMsg = req.messages && req.messages[0] ? req.messages[0].text : 'Aucun detail fourni.';
          const buyerMention = req.discordId ? `<@${req.discordId}>` : `**${req.pseudo}**`;

          const embed = new EmbedBuilder()
            .setTitle(`💎 Nouvelle Commande Atelier — ${req.id}`)
            .setDescription(`**Client :** ${buyerMention}\n**Sujet :** ${req.subject}`)
            .addFields(
              { name: 'Cahier des charges & Vision', value: firstMsg.substring(0, 1024) },
              { name: 'Statut Atelier', value: 'En attente de prise en charge (delai 72h)', inline: true },
              { name: 'Date de commande', value: `<t:${Math.floor(new Date(req.createdAt).getTime() / 1000)}:F>`, inline: true }
            )
            .setColor(0xf7941d)
            .setFooter({ text: 'YUFO The Jeweler • Atelier Prive FiveM' })
            .setTimestamp(new Date(req.createdAt));

          await channel.send({
            content: `👋 Bienvenue ${buyerMention} dans votre salon prive YUFO ! Un orfevre du staff va traiter votre demande.\nTous vos messages ici sont synchronises en temps reel avec votre espace sur le site web.`,
            embeds: [embed]
          });

          req.discordChannelId = channel.id;
          updated = true;

          // Mark existing messages as sent
          if (req.messages) {
            for (const m of req.messages) {
              sentMessageIds.add(m.id);
            }
          }
        } catch (chErr) {
          console.error(`Erreur creation salon pour ${req.id}:`, chErr.message);
        }
      }

      // 2. If channel exists, check for new messages from the website and post them to Discord
      if (req.discordChannelId && req.messages) {
        try {
          const channel = await client.channels.fetch(req.discordChannelId).catch(() => null);
          if (channel) {
            for (const msg of req.messages) {
              if (!sentMessageIds.has(msg.id)) {
                const authorLabel = msg.sender === 'client' ? `Client (${req.pseudo})` : 'Staff Atelier YUFO';
                await channel.send({
                  content: `💬 **[Web] ${authorLabel} :**\n>>> ${msg.text}`
                });
                sentMessageIds.add(msg.id);
              }
            }
          }
        } catch (msgSyncErr) {
          console.error(`Erreur sync messages pour ${req.discordChannelId}:`, msgSyncErr.message);
        }
      }
    }

    if (updated) {
      saveRequests(requests);
    }
  } catch (err) {
    console.error('Erreur syncOrdersAndMessages:', err.message);
  }
}

async function start() {
  console.log('[YUFO BOT] Demarrage du bot...');
  try {
    const clientWithContent = await createBot(true);
    await clientWithContent.login(TOKEN);
  } catch (err) {
    if (err.message && err.message.includes('disallowed intents')) {
      console.warn('[YUFO BOT] Fallback sans MessageContent intent...');
      const clientFallback = await createBot(false);
      await clientFallback.login(TOKEN);
    } else {
      console.error('[YUFO BOT] Erreur fatale:', err);
    }
  }
}

start();
