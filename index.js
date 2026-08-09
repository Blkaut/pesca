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
const WORKER_URL         = process.env.WORKER_URL;
const CANAL_COMANDOS     = process.env.CANAL_COMANDOS  || '1535104066546569287';
const CANAL_AUTO         = process.env.CANAL_AUTO      || '1535141122823954513';
const CANAL_VINCULAR     = process.env.CANAL_VINCULAR  || '1535822507645603892';

// Canais que o bot monitora
const CANAIS_MONITORADOS = [CANAL_COMANDOS, CANAL_VINCULAR];

// ── Pronto ────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅ BOTCedes online como ${client.user.tag}`);
});

// ── Recebe mensagens ──────────────────────────────────────────
client.on('messageCreate', async (message) => {
  // Ignora bots
  if (message.author.bot) return;

  // Só monitora canais configurados
  if (!CANAIS_MONITORADOS.includes(message.channel.id)) return;

  const texto = message.content.trim();
  if (!texto.startsWith('!')) return;

  try {
    const res = await fetch(`${WORKER_URL}/discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: message.channel.id,
        guild_id:   message.guildId,
        content:    message.content,
        author: {
          id:       message.author.id,
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
