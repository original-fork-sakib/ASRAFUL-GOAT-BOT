const {
	createCanvas,
	loadImage
} = require("canvas");

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

// ================================
// BACKGROUND VIDEOS
// ================================

const backgrounds = [

	"https://files.catbox.moe/ypk6ji.mp4",
	"https://files.catbox.moe/94k8sw.mp4",

	// ADD MORE VIDEO LINKS
	"",
	"",
	"",
	""

];

// ================================
// CACHE
// ================================

const backgroundCache = new Map();

// ================================
// DOWNLOAD FILE
// ================================

async function downloadFile(url, outputPath) {

	const response = await axios({
		url,
		method: "GET",
		responseType: "stream",
		headers: {
			"User-Agent": "Mozilla/5.0"
		}
	});

	return new Promise((resolve, reject) => {

		const writer = fs.createWriteStream(outputPath);

		response.data.pipe(writer);

		writer.on("finish", () => resolve(outputPath));

		writer.on("error", reject);
	});
}

// ================================
// EXTRACT VIDEO FRAME
// ================================

async function extractVideoFrame(videoUrl) {

	try {

		const tempDir =
			path.join(__dirname, "cache");

		await fs.ensureDir(tempDir);

		const videoPath =
			path.join(
				tempDir,
				`video_${Date.now()}.mp4`
			);

		const framePath =
			path.join(
				tempDir,
				`frame_${Date.now()}.jpg`
			);

		await downloadFile(videoUrl, videoPath);

		return new Promise((resolve, reject) => {

			ffmpeg(videoPath)

				.screenshots({
					count: 1,
					folder: tempDir,
					filename: path.basename(framePath),
					size: "1280x720"
				})

				.on("end", async () => {

					try {

						const img =
							await loadImage(framePath);

						if (fs.existsSync(videoPath)) {
							fs.unlinkSync(videoPath);
						}

						if (fs.existsSync(framePath)) {
							fs.unlinkSync(framePath);
						}

						resolve(img);

					} catch (e) {
						reject(e);
					}
				})

				.on("error", reject);
		});

	} catch (err) {

		console.error("Video frame error:", err);

		return null;
	}
}

// ================================
// LOAD BACKGROUND
// ================================

async function loadBackground(url) {

	if (!url) return null;

	if (backgroundCache.has(url)) {
		return backgroundCache.get(url);
	}

	try {

		// VIDEO
		if (url.endsWith(".mp4")) {

			const frame =
				await extractVideoFrame(url);

			if (frame) {

				backgroundCache.set(url, frame);

				return frame;
			}

			return null;
		}

		// IMAGE
		const response = await axios.get(url, {
			responseType: "arraybuffer"
		});

		const img =
			await loadImage(Buffer.from(response.data));

		backgroundCache.set(url, img);

		return img;

	} catch (error) {

		console.error(
			"Background error:",
			error.message
		);

		return null;
	}
}

// ================================
// DRAW PROFILE
// ================================

async function drawProfileImage(
	ctx,
	imageUrl,
	x,
	y,
	size,
	borderColor
) {

	const radius = size / 2;

	try {

		const response = await axios.get(imageUrl, {
			responseType: "arraybuffer"
		});

		const img =
			await loadImage(Buffer.from(response.data));

		ctx.shadowColor = borderColor;
		ctx.shadowBlur = 20;

		ctx.beginPath();

		ctx.arc(
			x,
			y,
			radius + 5,
			0,
			Math.PI * 2
		);

		ctx.fillStyle = borderColor;

		ctx.fill();

		ctx.shadowBlur = 0;

		ctx.save();

		ctx.beginPath();

		ctx.arc(
			x,
			y,
			radius,
			0,
			Math.PI * 2
		);

		ctx.clip();

		ctx.drawImage(
			img,
			x - radius,
			y - radius,
			size,
			size
		);

		ctx.restore();

	} catch {

		ctx.beginPath();

		ctx.arc(
			x,
			y,
			radius,
			0,
			Math.PI * 2
		);

		ctx.fillStyle = "#333";

		ctx.fill();
	}
}

// ================================
// CREATE CARD
// ================================

async function createWelcomeCard(
	gcImg,
	userImg,
	adderImg,
	userName,
	memberCount,
	threadName,
	adderName
) {

	const width = 1200;
	const height = 700;

	const canvas =
		createCanvas(width, height);

	const ctx =
		canvas.getContext("2d");

	// RANDOM BG
	const availableBackgrounds =
		backgrounds.filter(Boolean);

	const selectedBg =
		availableBackgrounds[
			Math.floor(
				Math.random() *
				availableBackgrounds.length
			)
		];

	console.log(
		"[WELCOME] Using:",
		selectedBg
	);

	const background =
		await loadBackground(selectedBg);

	// DRAW BG
	if (background) {

		ctx.drawImage(
			background,
			0,
			0,
			width,
			height
		);

	} else {

		ctx.fillStyle = "#000";

		ctx.fillRect(
			0,
			0,
			width,
			height
		);
	}

	// OVERLAY
	ctx.fillStyle = "rgba(0,0,0,0.4)";

	ctx.fillRect(
		0,
		0,
		width,
		height
	);

	// GROUP IMAGE
	await drawProfileImage(
		ctx,
		gcImg,
		width / 2,
		180,
		200,
		"#ffffff"
	);

	// USER IMAGE
	await drawProfileImage(
		ctx,
		userImg,
		120,
		height - 100,
		150,
		"#10b981"
	);

	// ADDER IMAGE
	await drawProfileImage(
		ctx,
		adderImg,
		width - 120,
		100,
		150,
		"#3b82f6"
	);

	// GROUP NAME
	ctx.textAlign = "center";

	ctx.font =
		'bold 38px "Segoe UI"';

	ctx.fillStyle = "#ffffff";

	ctx.fillText(
		threadName,
		width / 2,
		340
	);

	// GRADIENT
	const gradient =
		ctx.createLinearGradient(
			300,
			0,
			900,
			0
		);

	gradient.addColorStop(0, "#3b82f6");
	gradient.addColorStop(0.5, "#10b981");
	gradient.addColorStop(1, "#ec4899");

	// WELCOME
	ctx.font =
		'bold 82px "Segoe UI"';

	ctx.fillStyle = gradient;

	ctx.fillText(
		"WELCOME",
		width / 2,
		450
	);

	// USER NAME
	ctx.font =
		'bold 50px "Segoe UI"';

	ctx.fillStyle = "#10b981";

	ctx.fillText(
		userName,
		width / 2,
		540
	);

	// MEMBER
	ctx.font =
		'bold 28px "Segoe UI"';

	ctx.fillStyle = "#ffffff";

	ctx.fillText(
		`Member #${memberCount}`,
		width / 2,
		600
	);

	// ADDER
	ctx.textAlign = "right";

	ctx.font =
		'bold 22px "Segoe UI"';

	ctx.fillStyle = "#3b82f6";

	ctx.fillText(
		`Added by: ${adderName}`,
		width - 220,
		105
	);

	return canvas.toBuffer();
}

// ================================
// EXPORT
// ================================

module.exports = {

	config: {
		name: ["welcome", "welcome2"],
		version: "3.0",
		author: "MR_FARHAN",
		category: "events"
	},

	onStart: async ({
		threadsData,
		event,
		message,
		usersData
	}) => {

		if (
			event.logMessageType !==
			"log:subscribe"
		) return;

		try {

			const threadID =
				event.threadID;

			const addedUser =
				event.logMessageData
				.addedParticipants[0];

			const addedUserId =
				addedUser.userFbId;

			const adderId =
				event.author;

			const [
				threadInfo,
				userAvatar,
				adderAvatar,
				adderName
			] = await Promise.all([

				threadsData.get(threadID),

				usersData.getAvatarUrl(
					addedUserId
				),

				usersData.getAvatarUrl(
					adderId
				),

				usersData.getName(adderId)
			]);

			const userName =
				addedUser.fullName;

			const threadName =
				threadInfo.threadName ||
				"GROUP";

			const memberCount =
				threadInfo.members?.length || 1;

			const groupImage =
				threadInfo.imageSrc ||
				"https://i.imgur.com/7Qk8k6c.png";

			// CREATE IMAGE
			const imageBuffer =
				await createWelcomeCard(

					groupImage,

					userAvatar,

					adderAvatar,

					userName,

					memberCount,

					threadName,

					adderName
				);

			// TEMP PATH
			const tempDir =
				path.join(
					__dirname,
					"..",
					"..",
					"temp"
				);

			await fs.ensureDir(tempDir);

			const tempPath =
				path.join(
					tempDir,
					`welcome_${Date.now()}.png`
				);

			fs.writeFileSync(
				tempPath,
				imageBuffer
			);

			// SEND FIRST WELCOME
			await message.reply({

				body:
`🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸
━━━━━━━━━━━━━━━━━━
👤 Name: ${userName}
🏷️ Group: ${threadName}
🔢 Member: #${memberCount}
👑 Added By: ${adderName}
━━━━━━━━━━━━━━━━━━
Enjoy Your Stay 💖`,

				attachment:
					fs.createReadStream(
						tempPath
					)
			});

			// SEND SECOND WELCOME (AFTER SOME TIME)
			setTimeout(async () => {

				await message.reply({

					body:
`🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 AGAIN 🌸
━━━━━━━━━━━━━━━━━━
👤 Name: ${userName}
🏷️ Group: ${threadName}
🔢 Member: #${memberCount}
👑 Added By: ${adderName}
━━━━━━━━━━━━━━━━━━
We’re so glad to have you here! 😊`,

					attachment:
						fs.createReadStream(
							tempPath
						)
				});

			}, 5000); // 5 সেকেন্ড পরে দ্বিতীয় মেসেজ

			// DELETE TEMP
			setTimeout(() => {

				if (
					fs.existsSync(tempPath)
				) {

					fs.unlinkSync(tempPath);
				}

			}, 10000);

		} catch (err) {

			console.error(
				"[WELCOME ERROR]:",
				err
			);
		}
	}
};
