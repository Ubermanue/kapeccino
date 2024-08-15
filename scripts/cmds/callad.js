this.config = {
	name: "callad",
	version: "1.0.2",
	author: {
		name: "NTKhang",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "gửi báo cáo về admin bot",
	longDescription: "gửi báo cáo, góp ý, báo lỗi,... của bạn về admin bot",
	category: "contacts admin",
	guide: "{prefix}{name} <tin nhắn>"
};

module.exports = {
	config: this.config,
	start: async function ({ globalGoat, args, message, api, event, usersData, threadsData }) {
		if (!args[0]) return message.reply("Please enter the message you want to send to admin");
		const { senderID, threadID, isGroup } = event;

		const userData = await usersData.getData(senderID);
		const nameSender = userData.name;
		let msg = "==📨️ Report 📨️=="
			+ `\n${userData.gender == 2 ? "🚹" : "🚺"} Name: ${nameSender}`
			+ `\n🆔 User ID: ${senderID}`;

		msg += `\n👨‍👩‍👧‍👦 Từ ` + (isGroup ? `nhóm: ${(await threadsData.getData(threadID)).name}`
			+ `\n🆔 Thread ID: ${threadID}` : "individual");

		api.sendMessage({
			body: msg + `\n🆎 Content: ${args.join(" ")}\n─────────────────\nRespond to this message to send a message back to the user`,
			mentions: [{
				id: senderID,
				tag: nameSender
			}]
		}, globalGoat.config.adminBot[0], (err, info) => {
			if (err) return message.reply(`An error has occurred: ${err.name ? err.name + " " + err.message : err.errorSummary + "\n" + err.errorDescription}`);
			message.reply("Your report has been sent to admin successfully");
			globalGoat.whenReply[info.messageID] = {
				nameCmd: this.config.name,
				messageID: info.messageID,
				messageIDSender: event.messageID,
				threadIDSender: threadID,
				type: "userCallAdmin"
			};
		});
	},

	whenReply: async ({ globalGoat, args, event, api, message, Reply, usersData }) => {
		const { messageIDSender, threadIDSender, type } = Reply;
		const nameSender = (await usersData.getData(event.senderID)).name;

		switch (type) {
			case "userCallAdmin":
				api.sendMessage({
					body: `📍 Response from admin ${nameSender}\n${args.join(" ")}`
						+ `\n─────────────────\nReply to this message to continue sending messages to admin`,
					mentions: [{
						id: event.senderID,
						tag: nameSender
					}]
				}, threadIDSender, (err, info) => {
					if (err) return message.reply(`An error has occurred: ${err.name ? err.name + " " + err.message : err.errorSummary + "\n" + err.errorDescription}`);
					globalGoat.whenReply[info.messageID] = {
						nameCmd: this.config.name,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadIDSender: event.threadID,
						type: "adminReply"
					};
				}, messageIDSender);
				break;
			case "adminReply":
				api.sendMessage({
					body: `📝 Feedback from users ${nameSender}:`
						+ `\n🆔: ${event.senderID}`
						+ `\n🗣️: ${nameSender}`
						+ `\nContent:\n${args.join(" ")}`
						+ `\n─────────────────\nRespond to this message to send a message back to the user`,
					mentions: [{
						id: event.senderID,
						tag: nameSender
					}]
				}, threadIDSender, (err, info) => {
					if (err) return message.reply(`An error has occurred: ${err.name ? err.name + " " + err.message : err.errorSummary + "\n" + err.errorDescription}`);
					globalGoat.whenReply[info.messageID] = {
						nameCmd: this.config.name,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadIDSender: event.threadID,
						type: "userCallAdmin"
					};
				}, messageIDSender);
				break;
			default:
				break;
		}

	}
};
