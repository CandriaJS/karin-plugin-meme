import karin, { logger, Message, segment, karinPathBase } from "node-karin";

import { Config, Render } from "@/common";
import { utils } from "@/models";
import { Version } from "@/root";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const list = karin.command(
	/^#?(?:(?:柠糖)?(?:表情|(?:meme(?:s)?)))列表$/i,
	async (e: Message) => {
		if (!Config.meme.enable) return false;
		try {
			const keys = await utils.get_meme_all_keys();
			if (!keys || keys.length === 0) {
				await e.reply(
					`[${Version.Plugin_AliasName}]没有找到表情列表, 请使用[#柠糖表情更新资源], 稍后再试`,
					{ reply: true },
				);
				return true;
			}
			const tasks = keys.map(async (key) => {
				const [keywords, params] = await Promise.all([
					utils.get_meme_keyword(key) ?? [],
					utils.get_meme_info(key),
				]);

				if (!keywords || keywords.length === 0) {
					return [];
				}

				const min_texts = params?.min_texts ?? 0;
				const min_images = params?.min_images ?? 0;
				const options = params?.options ?? null;
				const types: string[] = [];
				if (min_texts >= 1) types.push("text");
				if (min_images >= 1) types.push("image");
				if (options !== null) types.push("option");

				return { name: keywords.join("/"), types };
			});
			const memeListAll = (await Promise.all(tasks)).flat();
			const img = await Render.list(memeListAll);
			const hash = make_hash(JSON.stringify(memeListAll)).slice(0, 8);
			const tempPath = path.join(
				karinPathBase,
				Version.Plugin_Name,
				"data",
				"temp",
			);
			if (!fs.existsSync(tempPath)) {
				fs.mkdirSync(tempPath, { recursive: true });
			}
			const filePath = path.join(tempPath, `meme_list_${hash}.png`);
			await fs.promises.writeFile(filePath, img);
			const imagePath = path.resolve(filePath).replace(/\\/g, "/");
			await e.reply(segment.image(`file://${imagePath}`)), { reply: true };
			return true;
		} catch (error) {
			logger.error(error);
		}
	},
	{
		name: "柠糖表情:表情列表",
		priority: -Infinity,
		event: "message",
		permission: "all",
	},
);

function make_hash(input: string) {
	return crypto.createHash("md5").update(input).digest("hex");
}
