!cmd install info.js const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "info2",
    version: "7.9",
    author: "👑 𝐀𝐒𝐑𝐀𝐅𝐔𝐋 𝐈𝐒𝐋𝐀𝐌 𝐒𝐀𝐊𝐈𝐁 🔒",
    role: 0,
    category: "owner"
  },

  onStart: async function ({ api, event }) {

    let loading;

    try {

      api.setMessageReaction("👑", event.messageID, () => {}, true);

      // ⏳ STEP 1: LOADING MESSAGE
      loading = await api.sendMessage(
`💠✨ 𝐊𝐈𝐍𝐆 𝐎𝐅 𝐒𝐀𝐊𝐈𝐁 𝐈𝐍𝐅𝐎 𝐋𝐎𝐀𝐃𝐈𝐍𝐆.. ✨💠
⏳🎀 𝐏𝐋𝐄𝐀𝐒𝐄 𝐖𝐀𝐈𝐓 👑🔥`,
        event.threadID
      );

      // 📌 INFO MESSAGE
      const msg = `
╔══════════════════════════╗
      𝐀𝐒𝐒𝐀𝐋𝐀𝐌𝐔 𝐀𝐋𝐀𝐈𝐊𝐔𝐌 ♻️🎀
╚══════════════════════════╝

╔═════════════════════════╗
  ‿🔥 𝐀𝐒𝐑𝐀𝐅𝐔𝐋 𝐈𝐒𝐋𝐀𝐌 𝐒𝐀𝐊𝐈𝐁 🔥
╚═════════════════════════╝

╭────〔 👤 ‿ 𝐒𝐀𝐊𝐈𝐁 𝐈𝐍𝐅𝐎 〕────╮
│ 👑 𝐍𝐀𝐌𝐄 ➤ 𝐒𝐀𝐊𝐈𝐁
│ 🎂 𝐀𝐆𝐄 ➤ 20+
│ 📘 𝐒𝐓𝐔𝐃𝐘 ➤ 𝐂𝐋𝐀𝐒𝐒 𝟏𝟎
│ 🚹 𝐆𝐄𝐍𝐃𝐄𝐑 ➤ 𝐌𝐀𝐋𝐄
│ 💔 𝐒𝐓𝐀𝐓𝐔𝐒 ➤ 𝐒𝐈𝐍𝐆𝐋𝐄
╰────────────────────╯

╭────〔 📍 𝐋𝐎𝐂𝐀𝐓𝐈𝐎𝐍 〕────╮
│ 🏠 𝐃𝐈𝐒𝐓𝐑𝐈𝐂𝐓 ➤ 𝐌𝐘𝐌𝐄𝐍𝐒𝐈𝐍𝐆𝐇
│ 🌍 𝐂𝐎𝐔𝐍𝐓𝐑𝐘 ➤ 𝐁𝐀𝐍𝐆𝐋𝐀𝐃𝐄𝐒𝐇
╰────────────────────╯

╭────〔 🧬 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋 〕────╮
│ 👪 𝐅𝐀𝐌𝐈𝐋𝐘 ➤ 𝐁𝐈𝐆 𝐒𝐎𝐍 😎
│ 💞 𝐆𝐅 ➤ 𝐍𝐎 😏
╰────────────────────╯

╭────〔 🎯 𝐇𝐎𝐁𝐁𝐘 〕────╮
│ 🔥 𝐅𝐑𝐈𝐄𝐍𝐃𝐒 𝐀𝐃𝐃𝐀
│ 📱 𝐌𝐎𝐁𝐈𝐋𝐄 𝐔𝐒𝐄
│ 🎧 𝐌𝐔𝐒𝐈𝐂 𝐋𝐈𝐒𝐓𝐄𝐍
╰────────────────────╯

╭────〔 💋 𝐒𝐏𝐄𝐂𝐈𝐀𝐋 〕────╮
│ 😘 𝐆𝐈𝐑𝐋𝐒 = 𝐔𝐌𝐌𝐀𝐇
╰────────────────────╯

╭────〔 🌐 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 〕────╮
│ 🌐 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 ➤ facebook.com/61586259527420
│ 📞 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 ➤ +8801790452366
╰────────────────────╯

╔════════════════════════════╗
        🖤 𝐀𝐓𝐓𝐈𝐓𝐔𝐃𝐄 🖤
╚════════════════════════════╝

➤ 😎 𝐈 𝐋𝐈𝐕𝐄 𝐌𝐘 𝐎𝐖𝐍 𝐖𝐀𝐘  
➤ 🔥 𝐈 𝐀𝐌 𝐍𝐎𝐓 𝐀 𝐂𝐎𝐏𝐘  
➤ 🖤 𝐈 𝐀𝐌 𝐀𝐋𝐖𝐀𝐘𝐒 𝐑𝐄𝐀𝐋  
➤ 💀 𝐍𝐎 𝐑𝐄𝐒𝐏𝐄𝐂𝐓 𝐅𝐎𝐑 𝐅𝐀𝐊𝐄  

╭────〔 🔥 𝐁𝐑𝐀𝐍𝐃 〕────╮
│ 👑 𝐒𝐀𝐊𝐈𝐁 𝐕𝐈𝐏
│ ✔️ 𝐎𝐑𝐈𝐆𝐈𝐍𝐀𝐋
│ ❌ 𝐍𝐎 𝐂𝐎𝐏𝐘
╰────────────────────╯

╭────〔 💍 𝐌𝐀𝐑𝐑𝐈𝐀𝐆𝐄 〕────╮
│ 🎀 𝐖𝐈𝐋𝐋 𝐃𝐎 𝐀𝐒 𝐏𝐀𝐑𝐄𝐍𝐓𝐒 𝐒𝐀𝐘
╰────────────────────╯
`;

      const videoUrl = "https://files.catbox.moe/h8k4cx.mp4";

      // 🎥 STEP 2: SEND INFO FIRST
      await api.sendMessage({
        body: msg,
        attachment: await global.utils.getStreamFromURL(videoUrl)
      }, event.threadID);

      // ⛔ STEP 3: DELETE LOADING AFTER INFO SENT
      try {
        await api.unsendMessage(loading.messageID);
      } catch {}

    } catch (e) {
      console.log(e);
      api.sendMessage("❌ INFO SYSTEM ERROR", event.threadID);
    }
  }
};
