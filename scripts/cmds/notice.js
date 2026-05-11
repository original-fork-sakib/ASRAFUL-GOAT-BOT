const axios = require("axios");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 👉 এখানে যত খুশি prefix রাখতে পারো
const PREFIXES = [".", "!", "/"];

module.exports = {
  config: {
    name: "notice",
    version: "1.0",
    author: "ChatGPT",
    role: 0,
    category: "flexible-notice"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    try {
      const body = (event.body || "").toLowerCase().trim();

      // check prefix dynamically
      const hasPrefix = PREFIXES.some(p => body.startsWith(p));

      if (!hasPrefix) {
        // no-prefix trigger support
        if (body === "নোটিশ" || body === "notice") {
          return this.runNotice(message);
        }
        return;
      }

      // remove prefix
      const cmd = body.slice(1).trim();

      if (cmd === "নোটিশ" || cmd === "notice") {
        return this.runNotice(message);
      }

    } catch (err) {
      console.log("Notice Error:", err);
    }
  },

  runNotice: async function (message) {

    await message.reply("⏳ নোটিশ লোড হচ্ছে...");

    await delay(1200);

    const attachment = (await axios({
      url: "https://files.catbox.moe/ovgvjs.mp4",
      method: "GET",
      responseType: "stream"
    })).data;

    return message.reply({
      body: `💠✨══════════════════════✨💠
      👑 𝑽𝑰𝑷 𝑵𝑶𝑻𝑰𝑪𝑬 👑
💠✨══════════════════════✨💠

💐 আসসালামু আলাইকুম 💐

✨ "Respect everyone, stay active, and grow together." ✨

━━━━━━━━━━━━━━━━━━━━━━

⚡ অফিসিয়াল গ্রুপ নোটিশ ⚡

📌 গুরুত্বপূর্ণ নিয়মাবলী:

➤ সবাইকে নিয়ম মানতে হবে 💯  
➤ একটিভ থাকতে হবে 🔥  
➤ কলে অবশ্যই জয়েন করতে হবে 📞  
➤ যারা কলে আসবে না তাদের মনিটর করা হবে ⚠️  
➤ নির্দিষ্ট সময় অনঅ্যাকটিভ থাকলে গ্রুপ থেকে রিমুভ করা হবে 🚫  
➤ খারাপ ব্যবহার নিষিদ্ধ 🚫  
➤ লিংক শেয়ার নিষিদ্ধ 🚫  

━━━━━━━━━━━━━━━━━━━━━━

👑 Bot Owner 👑  
✨ 𝐒𝐀𝐊𝐈𝐁 𝐀𝐑 𝐁𝐎𝐓 ✨  

━━━━━━━━━━━━━━━━━━━━━━

👑 Group Creator 👑  
✨ 𝐀𝐒𝐑𝐀𝐅𝐔𝐋 𝐈𝐒𝐈𝐀𝐌 𝐒𝐀𝐊𝐈𝐁 ✨  

💠✨══════════════════════✨💠`,
      attachment
    });
  }
};
