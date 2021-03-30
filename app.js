require("dotenv").config();
const fetch = require("node-fetch");
const Discord = require("discord.js");
const {
  DiscordInteractions,
  ApplicationCommandOptionType,
} = require("slash-commands");
const client = new Discord.Client();

const interaction = new DiscordInteractions({
  applicationId: process.env.CLIENT_ID,
  authToken: process.env.BOT_TOKEN,
  publicKey: process.env.PUBLIC_KEY,
});

client.once("ready", async () => {
  console.log("Ready!");

  client.channels.fetch("825807863661592628").then((channel) => {
    // channel.send("I've been restarted. :sunrise:");
  });

  await interaction
    .getApplicationCommands("825807863146479657")
    .then((commands) =>
      commands.forEach((command) => {
        interaction
          .deleteApplicationCommand(command.id)
          .then(console.log)
          .catch(console.error);
      })
    )
    .catch(console.error);

  const command = {
    name: "mc-whitelist",
    description: "Whitelist yourself on the blahajgang.lol Minecraft Server",
    options: [
      {
        name: "mc-username",
        description: "Your minecraft username",
        type: ApplicationCommandOptionType.STRING,
      },
    ],
  };

  await interaction
    .createApplicationCommand(command, "825807863146479657")
    .then(console.log)
    .catch(console.error);

  client.ws.on("INTERACTION_CREATE", async (interaction) => {
    let username = null;
    const usernames = interaction.data.options.filter(
      ({ name }) => name === "mc-username"
    );

    if (usernames.length) {
      username = usernames[0].value;
    } else {
      return;
    }

    const { id } = await fetch(
      "https://api.mojang.com/users/profiles/minecraft/" + username
    ).then((res) => res.json());

    await client.api
      .interactions(interaction.id, interaction.token)
      .callback.post({
        data: {
          type: 4,
          data: {
            content: `Whitelisted \`${username}\` with uuid of \`${id}\``,
            flags: 64,
          },
        },
      });
  });
});

client.on("message", (message) => {
  if (message.mentions.has(client.user.id)) {
    message.reply("I am here, yes. :pick:");
  }
});

client.login(process.env.BOT_TOKEN);