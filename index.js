// ============================================================
// BOTCedes — Discord Bot
// Lê comandos do canal e encaminha para o Cloudflare Worker
// ============================================================

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Configuração ──────────────────────────────────────────────
const DISCORD_TOKEN      = process.env.DISCORD_TOKEN;
const WORKER_URL         = process.env.WORKER_URL; // ex: https://pesca-bot.SEU_SUBDOMINIO.workers.dev
const CANAL_COMANDOS     = process.env.CANAL_COMANDOS     || '1535104066546569287';
const CANAL_AUTO         = process.env.CANAL_AUTO         || '1535141122823954513';

// ── Pronto ────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅ BOTCedes online como ${client.user.tag}`);
});

// ── Recebe mensagens ──────────────────────────────────────────
client.on('messageCreate', async (message) => {
  // Ignora bots e outros canais
  if (message.author.bot) return;
  if (message.channel.id !== CANAL_COMANDOS) return;

  const texto = message.content.trim();
  if (!texto.startsWith('!')) return;

  try {
    // Envia para o Worker
    const res = await fetch(`${WORKER_URL}/discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: message.channel.id,
        content:    message.content,
        author: {
          username: message.author.username,
          bot:      message.author.bot,
        },
      }),
    });

    if (!res.ok) {
      console.error('Erro no Worker:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Erro ao chamar Worker:', err.message);
  }
});

// ── Login ─────────────────────────────────────────────────────
client.login(DISCORD_TOKEN);
