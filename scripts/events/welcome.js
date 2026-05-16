const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {

	config: {
		name: "welcome",
		version: "7.0",
		author: "MR_FARHAN",
		category: "events",
		eventType: ["log:subscribe"]
	},

	onStart: async function ({ api, event, usersData, threadsData }) {

		if (event.logMessageType !== "log:subscribe") return;

		// ================= LOADING =================
		const loading = await api.sendMessage(
			"⏳ Loading Welcome Card...",
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
				return api.sendMessage("❌ Thread info error!", event.threadID);
			}

			const threadName = threadInfo.threadName || "Group";

			// ✅ FIXED MEMBER COUNT
			const memberCount =
				threadInfo.participantIDs?.length ||
				(event.logMessageData?.addedParticipants?.length || 1);

			const userName = addedUser.fullName;

			const userAvatar = await usersData.getAvatarUrl(uid);
			const adderAvatar = await usersData.getAvatarUrl(adderId);
			const adderName = await usersData.getName(adderId);

			const groupImage =
				threadInfo.imageSrc ||
				"https://i.imgur.com/7Qk8k6c.png";

			// ================= VIDEO BACKGROUND =================
			const videos = [
				"https://files.catbox.moe/ypk6ji.mp4",
				"https://files.catbox.moe/94k8sw.mp4"
			];

			const randomVideo = videos[Math.floor(Math.random() * videos.length)];

			const videoPath = path.join(tempDir, `v_${Date.now()}.mp4`);
			const framePath = path.join(tempDir, `f_${Date.now()}.jpg`);

			// download video
			const res = await axios({ url: randomVideo, responseType: "stream" });
			const writer = fs.createWriteStream(videoPath);

			res.data.pipe(writer);

			await new Promise((resolve, reject) => {
				writer.on("finish", resolve);
				writer.on("error", reject);
			});

			// extract frame
			await new Promise((resolve, reject) => {
				ffmpeg(videoPath)
					.screenshots({
						count: 1,
						folder: tempDir,
						filename: path.basename(framePath),
						size: "1280x720"
					})
					.on("end", resolve)
					.on("error", reject);
			});

			let bg;
			try {
				bg = await loadImage(framePath);
			} catch {
				const imgRes = await axios.get(groupImage, { responseType: "arraybuffer" });
				bg = await loadImage(Buffer.from(imgRes.data));
			}

			// ================= CANVAS =================
			const canvas = createCanvas(1200, 700);
			const ctx = canvas.getContext("2d");

			ctx.drawImage(bg, 0, 0, 1200, 700);
			ctx.fillStyle = "rgba(0,0,0,0.45)";
			ctx.fillRect(0, 0, 1200, 700);

			// ================= AVATAR =================
			async function circle(url, x, y, size) {
				try {
					const res = await axios.get(url, { responseType: "arraybuffer" });
					const img = await loadImage(Buffer.from(res.data));

					const r = size / 2;

					ctx.beginPath();
					ctx.arc(x, y, r, 0, Math.PI * 2);
					ctx.clip();

					ctx.drawImage(img, x - r, y - r, size, size);

					ctx.restore?.();
				} catch {}
			}

			await circle(groupImage, 600, 180, 200);
			await circle(userAvatar, 120, 600, 150);
			await circle(adderAvatar, 1080, 100, 150);

			// ================= TEXT =================
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

			// ================= SAVE =================
			const output = path.join(tempDir, `welcome_${Date.now()}.png`);
			fs.writeFileSync(output, canvas.toBuffer());

			// ================= SEND =================
			api.sendMessage({

				body: `🌸 WELCOME 🌸
━━━━━━━━━━━━━━
👤 ${userName}
🏷️ ${threadName}
🔢 Member #${memberCount}
👑 Added by ${adderName}
━━━━━━━━━━━━━━`,

				attachment: fs.createReadStream(output)

			}, event.threadID, () => {

				if (loading?.messageID) {
					api.unsendMessage(loading.messageID);
				}

			});

			// ================= CLEAN =================
			setTimeout(() => {

				[videoPath, framePath, output].forEach(file => {
					if (fs.existsSync(file)) fs.unlinkSync(file);
				});

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
