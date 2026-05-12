const axios = require("axios");
const { getPrefix, getStreamFromURL } = global.utils;
const { commands } = global.GoatBot;
const fs = require("fs");

let xfont = null;
let yfont = null;
let categoryEmoji = null;

// ✅ NEW VIDEO LINK FIXED
const HELP_GIF = "https://files.catbox.moe/txxlye.mp4";

// 🔒 AUTHOR LOCK SYSTEM
const AUTHOR_NAME = "FARHAN-KHAN";
const FILE_PATH = __filename;

function checkAuthorLock() {
  try {
    const fileData = fs.readFileSync(FILE_PATH, "utf-8");

    if (!fileData.includes(`author: "${AUTHOR_NAME}"`)) {
      console.log("❌ AUTHOR CHANGED! FILE LOCKED.");
      return false;
    }

    return true;

  } catch (e) {
    console.log("❌ ERROR CHECKING AUTHOR LOCK");
    return false;
  }
}

async function loadResources() {
  try {

    const [x, y, c] = await Promise.all([
      axios.get("https://raw.githubusercontent.com/Saim-x69x/sakura/main/xfont.json"),
      axios.get("https://raw.githubusercontent.com/Saim-x69x/sakura/main/yfont.json"),
      axios.get("https://raw.githubusercontent.com/Saim-x69x/sakura/main/category.json")
    ]);

    xfont = x.data;
    yfont = y.data;
    categoryEmoji = c.data;

  } catch (e) {

    console.error("[HELP] Resource load failed", e);

    xfont = xfont || {};
    yfont = yfont || {};
    categoryEmoji = categoryEmoji || {};
  }
}

function fontConvert(text, type = "command") {
  const map = type === "category" ? xfont : yfont;

  if (!map) return text;

  return text
    .split("")
    .map(c => map[c] || c)
    .join("");
}

function getCategoryEmoji(cat) {
  return categoryEmoji?.[cat.toLowerCase()] || "🗂️";
}

function roleText(role) {
  const roles = {
    0: "All Users",
    1: "Group Admins",
    2: "Bot Admin"
  };

  return roles[role] || "Unknown";
}

function findCommand(name) {

  name = name.toLowerCase();

  for (const [, cmd] of commands) {

    const a = cmd.config?.aliases;

    if (cmd.config?.name === name)
      return cmd;

    if (Array.isArray(a) && a.includes(name))
      return cmd;

    if (typeof a === "string" && a === name)
      return cmd;
  }

  return null;
}

module.exports = {
  config: {
    name: "help",
    aliases: ["menu"],
    version: "2.1",
    author: "FARHAN-KHAN",
    role: 0,
    category: "info",
    shortDescription: "Show all commands",
    guide: "{pn} | {pn} <command> | {pn} -c <category>"
  },

  onStart: async function ({ message, args, event, role }) {

    // 🔒 AUTHOR CHECK
    if (!checkAuthorLock()) {
      return message.reply("❌ FILE LOCKED! DON'T CHANGE AUTHOR.");
    }

    if (!xfont || !yfont || !categoryEmoji)
      await loadResources();

    const prefix = getPrefix(event.threadID);
    const input = args.join(" ").trim();

    const categories = {};

    for (const [name, cmd] of commands) {

      if (!cmd?.config || cmd.config.role > role)
        continue;

      const cat = (cmd.config.category || "UNCATEGORIZED").toUpperCase();

      if (!categories[cat])
        categories[cat] = [];

      categories[cat].push(name);
    }

    // ✅ CATEGORY VIEW
    if (args[0] === "-c" && args[1]) {

      const cat = args[1].toUpperCase();

      if (!categories[cat]) {
        return message.reply(`❌ Category "${cat}" not found`);
      }

      let msg = `╭─────✰『 ${getCategoryEmoji(cat)} ${fontConvert(cat, "category")} 』\n`;

      for (const c of categories[cat].sort()) {
        msg += `│⚡ ${fontConvert(c)}\n`;
      }

      msg += `╰────────────✰\n`;
      msg += `> TOTAL: ${categories[cat].length}\n`;
      msg += `> PREFIX: ${prefix}`;

      return message.reply({
        body: msg,
        attachment: await getStreamFromURL(HELP_GIF)
      });
    }

    // ✅ MAIN HELP MENU
    if (!input) {

      let msg = `╭───────❁\n`;
      msg += `│✨ 𝐒𝐀𝐊𝐈𝐁 𝗛𝗘𝗟𝗣 𝗟𝗜𝗦𝗧 ✨\n`;
      msg += `╰────────────❁\n`;

      for (const cat of Object.keys(categories).sort()) {

        msg += `╭─────✰『 ${getCategoryEmoji(cat)} ${fontConvert(cat, "category")} 』\n`;

        for (const c of categories[cat].sort()) {
          msg += `│⚡ ${fontConvert(c)}\n`;
        }

        msg += `╰────────────✰\n`;
      }

      const total = Object.values(categories)
        .reduce((a, b) => a + b.length, 0);

      msg += `╭─────✰[🌟 𝐄𝐍𝐉𝐎𝐘 🌟]\n`;
      msg += `│> TOTAL COMMANDS: [${total}]\n`;
      msg += `│\n`;
      msg += `│> TYPE: [ ${prefix}HELP <COMMAND> ]\n`;
      msg += `│\n`;
      msg += `│> FB.LINK: [https://www.facebook.com/Sak ib]\n`;
      msg += `╰────────────✰\n`;

      msg += `╭─────✰\n`;
      msg += `│ 💖 𝗦𝗜𝗭𝗨𝗞𝗔-𝗕𝗢𝗧 💖\n`;
      msg += `╰────────────✰`;

      return message.reply({
        body: msg,
        attachment: await getStreamFromURL(HELP_GIF)
      });
    }
  }
};
