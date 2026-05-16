const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {

	config: {
		name: "welcome",
		version: "5.0",
		author: "MR_FARHAN",
		category: "events",
		eventType: ["log:subscribe"]
	},

	onStart: async function ({ api, event, usersData, threadsData }) {

		if (event.logMessageType !== "log:subscribe") return;

		const loading = await api.sendMessage(
			"⏳ Welcome Loading...",
			event.threadID
		);

		try {

			const tempDir = path.join(__dirname, "cache");
			await fs.ensureDir(tempDir);

			const addedUser = event.logMessageData.addedParticipants[0];

			const uid = addedUser.userFbId;
			const adderId = event.author;

			const threadInfo = await threadsData.get(event.threadID);

			if (!threadInfo) {
				return api.sendMessage(
					"❌ Thread info not found!",
					event.threadID
				);
			}

			const threadName = threadInfo.threadName || "Group";

			// SAFE FIX (Railway compatible)
			const memberCount =
				threadInfo.participantIDs?.length || 1;

			const userName = addedUser.fullName;

			const userAvatar = await usersData.getAvatarUrl(uid);
			const adderAvatar = await usersData.getAvatarUrl(adderId);
			const adderName = await usersData.getName(adderId);

			const groupImage =
				threadInfo.imageSrc ||
				"https://i.imgur.com/7Qk8k6c.png";

			// ================= IMAGE LOAD =================

			const bgRes = await axios.get(groupImage, {
				responseType: "arraybuffer"
			});

			const bg = await loadImage(Buffer.from(bgRes.data));

			const canvas = createCanvas(1200, 700);
			const ctx = canvas.getContext("2d");

			ctx.drawImage(bg, 0, 0, 1200, 700);

			ctx.fillStyle = "rgba(0,0,0,0.45)";
			ctx.fillRect(0, 0, 1200, 700);

			// ================= CIRCLE FUNCTION =================

			async function drawCircle(url, x, y, size, color) {

				try {

					const res = await axios.get(url, {
						responseType: "arraybuffer"
					});

					const img = await loadImage(Buffer.from(res.data));

					const r = size / 2;

					ctx.shadowColor = color;
					ctx.shadowBlur = 15;

					ctx.beginPath();
					ctx.arc(x, y, r + 5, 0, Math.PI * 2);
					ctx.fillStyle = color;
					ctx.fill();

					ctx.shadowBlur = 0;

					ctx.save();
					ctx.beginPath();
					ctx.arc(x, y, r, 0, Math.PI * 2);
					ctx.clip();

					ctx.drawImage(img, x - r, y - r, size, size);
					ctx.restore();

				} catch (e) {
					console.log("Avatar error:", e.message);
				}
			}

			// ================= DRAW =================

			await drawCircle(groupImage, 600, 180, 200, "#ffffff");
			await drawCircle(userAvatar, 120, 600, 150, "#10b981");
			await drawCircle(adderAvatar, 1080, 100, 150, "#3b82f6");

			// TEXT
			ctx.textAlign = "center";

			ctx.font = "bold 40px Arial";
			ctx.fillStyle = "#fff";
			ctx.fillText(threadName, 600, 340);

			const grad = ctx.createLinearGradient(300, 0, 900, 0);
			grad.addColorStop(0, "#3b82f6");
			grad.addColorStop(0.5, "#10b981");
			grad.addColorStop(1, "#ec4899");

			ctx.font = "bold 80px Arial";
			ctx.fillStyle = grad;
			ctx.fillText("WELCOME", 600, 450);

			ctx.font = "bold 50px Arial";
			ctx.fillStyle = "#10b981";
			ctx.fillText(userName, 600, 540);

			ctx.font = "bold 28px Arial";
			ctx.fillStyle = "#fff";
			ctx.fillText(`Member #${memberCount}`, 600, 600);

			const output = path.join(tempDir, `welcome_${Date.now()}.png`);
			fs.writeFileSync(output, canvas.toBuffer());

			api.sendMessage({

				body: `🌸 WELCOME 🌸
👤 ${userName}
🏷️ ${threadName}
🔢 Member #${memberCount}
👑 Added by ${adderName}`,

				attachment: fs.createReadStream(output)

			}, event.threadID, () => {

				if (loading?.messageID) {
					api.unsendMessage(loading.messageID);
				}

			});

			setTimeout(() => {
				if (fs.existsSync(output)) fs.unlinkSync(output);
			}, 10000);

		} catch (err) {

			console.log("WELCOME ERROR:", err);
			api.sendMessage(
				"❌ Welcome system error: " + err.message,
				event.threadID
			);
		}
	}
};
