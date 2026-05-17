const fs = require("fs");
const { downloadVideo } = require("sagor-video-downloader");

// 🔒 LOCK CONFIG
const AUTHOR = "FARHAN-KHAN";
const COMMAND_NAME = "autolink";

module.exports = {
    config: {
        name: COMMAND_NAME,
        version: "1.5",
        author: AUTHOR + " (DON'T CHANGE)",
        countDown: 5,
        role: 0,
        shortDescription: "Auto-download & send videos silently",
        category: "media",
    },

    onStart: async function () {

        // 🔒 SECURITY CHECK
        if (
            module.exports.config.author !== AUTHOR + " (DON'T CHANGE)" ||
            module.exports.config.name !== COMMAND_NAME
        ) {
            throw new Error("⛔ Unauthorized file modification detected!");
        }
    },

    onChat: async function ({ api, event }) {

        // 🔒 SECURITY CHECK
        if (
            module.exports.config.author !== AUTHOR + " (DON'T CHANGE)" ||
            module.exports.config.name !== COMMAND_NAME
        ) {
            return;
        }

        const threadID = event.threadID;
        const messageID = event.messageID;
        const message = event.body || "";

        const linkMatches = message.match(/(https?:\/\/[^\s]+)/g);

        if (!linkMatches || linkMatches.length === 0)
            return;

        const uniqueLinks = [...new Set(linkMatches)];

        api.setMessageReaction("⏳", messageID, () => {}, true);

        let successCount = 0;
        let failCount = 0;

        for (const url of uniqueLinks) {

            try {

                // ⏳ LOADING MESSAGE
                const loadingMsg = await api.sendMessage(
                    "♻️ গরিব ওয়েট কর ভিডিও দিচ্ছি 😎",
                    threadID
                );

                const { title, filePath } = await downloadVideo(url);

                if (!filePath || !fs.existsSync(filePath))
                    throw new Error();

                const stats = fs.statSync(filePath);

                const fileSizeInMB =
                    stats.size / (1024 * 1024);

                // ❌ FILE TOO BIG
                if (fileSizeInMB > 25) {

                    fs.unlinkSync(filePath);

                    failCount++;

                    // 🗑 DELETE LOADING MESSAGE
                    api.unsendMessage(loadingMsg.messageID);

                    continue;
                }

                // 📩 SEND VIDEO
                await api.sendMessage(
                    {
                        body:
`📥𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋 ✅
━━━━━━━━━━━━━━━━━━━━
𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐒𝐑𝐀𝐅𝐔𝐋 𝐈𝐒𝐋𝐀𝐌 𝐒𝐀𝐊𝐈𝐁
🎬 ᴛɪᴛʟᴇ: ${title || "Video File"}
📦 sɪᴢᴇ: ${fileSizeInMB.toFixed(2)} MB
━━━━━━━━━━━━━━━━━━━━`,
                        attachment: fs.createReadStream(filePath)
                    },
                    threadID,
                    () => {

                        fs.unlinkSync(filePath);

                    }
                );

                // 🗑 DELETE LOADING MESSAGE AFTER VIDEO SENT
                api.unsendMessage(loadingMsg.messageID);

                successCount++;

            } catch {

                failCount++;

            }
        }

        const finalReaction =
            successCount > 0 && failCount === 0
                ? "✅"
                : successCount > 0
                ? "⚠️"
                : "❌";

        api.setMessageReaction(
            finalReaction,
            messageID,
            () => {},
            true
        );
    }
};
