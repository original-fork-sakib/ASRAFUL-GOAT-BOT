const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const { createCanvas, loadImage } = require("canvas");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const backgrounds = [
	"https://files.catbox.moe/ypk6ji.mp4",
	"https://files.catbox.moe/94k8sw.mp4",
	"",
	"",
	""
];

module.exports = {

	config: {
		name: "welcome",
		version: "4.0",
		author: "MR_FARHAN",
		category: "events",
		eventType: ["log:subscribe"]
	},

	onStart: async function ({ api, event, usersData, threadsData }) {

		if (event.logMessageType !== "log:subscribe") return;

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

			const threadName = threadInfo.threadName || "Group";
			const memberCount = threadInfo.members?.length || 1;

			const userName = addedUser.fullName;

			const userAvatar = await usersData.getAvatarUrl(uid);
			const adderAvatar = await usersData.getAvatarUrl(adderId);
			const adderName = await usersData.getName(adderId);

			const groupImage = threadInfo.imageSrc || "https://i.imgur.com/7Qk8k6c.png";

			// random bg
			const list = backgrounds.filter(Boolean);
			const bg = list[Math.floor(Math.random() * list.length)];

			let image;

			// ================= VIDEO HANDLING =================
			if (bg.endsWith(".mp4")) {

				const videoPath = path.join(tempDir, `v_${Date.now()}.mp4`);
				const framePath = path.join(tempDir, `f_${Date.now()}.jpg`);

				const res = await axios({ url: bg, responseType: "stream" });
				const writer = fs.createWriteStream(videoPath);

				res.data.pipe(writer);

				await new Promise((resolve, reject) => {
					writer.on("finish", resolve);
					writer.on("error", reject);
				});

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

				image = await loadImage(framePath);

				fs.unlinkSync(videoPath);
				fs.unlinkSync(framePath);

			} else {

				const res = await axios.get(groupImage, {
					responseType: "arraybuffer"
				});

				image = await loadImage(Buffer.from(res.data));
			}

			// ================= CANVAS =================

			const canvas = createCanvas(1200, 700);
			const ctx = canvas.getContext("2d");

			ctx.drawImage(image, 0, 0, 1200, 700);

			ctx.fillStyle = "rgba(0,0,0,0.4)";
			ctx.fillRect(0, 0, 1200, 700);

			// user avatar
			async function circle(imgUrl, x, y, size, color) {

				const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
				const img = await loadImage(Buffer.from(res.data));

				const r = size / 2;

				ctx.shadowColor = color;
				ctx.shadowBlur = 20;

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
			}

			await circle(groupImage, 600, 180, 200, "#fff");
			await circle(userAvatar, 120, 600, 150, "#10b981");
			await circle(adderAvatar, 1080, 100, 150, "#3b82f6");

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
				body: `🌸 WELCOME 🌸\n👤 ${userName}\n🏷️ ${threadName}\n🔢 Member #${memberCount}\n👑 Added by ${adderName}`,
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
			console.log(err);
			api.sendMessage("❌ Welcome system error!", event.threadID);
		}
	}
};
