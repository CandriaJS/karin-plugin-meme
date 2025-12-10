import path from "node:path";

import karin, { ImageElement, segment } from "node-karin";
import * as component from "@puniyu/component";
import { Config } from "@/common/config";
import { Version } from "@/root";
import { createCanvas, loadImage } from "canvas";

/**
 * 渲染精度
 * @param {string} pct 缩放百分比
 */
function scale(pct = 1) {
	const renderScale = Config.other.renderScale || 100;
	const scale = Math.min(2, Math.max(0.5, renderScale / 100));
	pct = pct * scale;
	return `style=transform:scale(${pct})`;
}

/**
 * 渲染
 * @param name 文件名称 不包含 `.html`
 * @param params 渲染参数
 */
const Render = {
  async render(name: string, params: Record<string, any> = {}) {
    name = name.replace(/.html$/, "");
    const root = `${Version.Plugin_Path}/resources`;
    const img = await karin.render({
      type: "jpeg",
      encoding: "base64",
      name: path.basename(name),
      file: `${root}/${name}.html`,
      data: {
        _res_path: `${Version.Plugin_Path}/resources`.replace(/\\/g, "/"),
        defaultLayout:
          `${Version.Plugin_Path}/resources/common/layout/default.html`.replace(
            /\\/g,
            "/"
          ),
        sys: {
          scale: scale(params.scale ?? 1),
        },
        copyright: `${Version.Bot_Name}<span class="version"> ${Version.Bot_Version}</span> & ${Version.Plugin_Name}<span class="version"> ${Version.Plugin_Version}`,
        ...params,
      },
      screensEval: "#containter",
      multiPage: 12000,
      pageGotoParams: {
        waitUntil: "networkidle0",
        timeout: 60000,
      },
    });
    const ret: ImageElement[] = [];
    for (const image of img) {
      const base64Image = image.startsWith("base64://")
        ? image
        : `base64://${image}`;
      ret.push(segment.image(base64Image));
    }

    return ret;
  },
  async list(data: { name: string; types: string[] }[]) {
    const width = 1200;
    const minHeight = 600;
    const padding = 40;
    const columnCount = 3;
    const columnGap = 32;
    const rowHeight = 68;
    const headerHeight = 160;
    const headerMarginBottom = 20;
    const columnWidth = Math.floor(
      (width - padding * 2 - columnGap * (columnCount - 1)) / columnCount
    );

    const itemsPerColumn = Math.ceil(data.length / columnCount);
    const totalRows = itemsPerColumn;
    const neededHeight = headerHeight + totalRows * rowHeight + padding * 2;
    const realHeight = Math.max(minHeight, neededHeight);

    const canvas = createCanvas(width, realHeight);
    const ctx = canvas.getContext("2d");

    // 背景
    const bg = await loadImage(
      `${Version.Plugin_Path}/resources/background.webp`,
    )
    ctx.drawImage(bg, 0, 0, width, realHeight);

    ctx.save();
    const headerBoxWidth = width - padding * 2;
    const headerBoxHeight = 110;
    const headerBoxX = padding;
    const headerBoxY = padding;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.roundRect(headerBoxX, headerBoxY, headerBoxWidth, headerBoxHeight, 12);
    ctx.fill();

    // 绘制标题
    ctx.font = "48px SmileySans";
    ctx.fillStyle = "#333";
    ctx.textBaseline = "top";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 8;

    const title = "柠糖表情列表";
    const titleWidth = ctx.measureText(title).width;
    const centerXTitle = (width - titleWidth) / 2;
    ctx.fillText(title, centerXTitle, padding + 15);

    // 绘制副标题
    ctx.font = "24px SmileySans";
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#666";
    const subtitle = `表情总数：${data.length}`;
    const subtitleWidth = ctx.measureText(subtitle).width;
    const centerXSubtitle = (width - subtitleWidth) / 2;
    ctx.fillText(subtitle, centerXSubtitle, padding + 70);

    ctx.restore();

    const textIcon = await loadImage(
      `${Version.Plugin_Path}/resources/icons/text.svg`
    );
    const imageIcon = await loadImage(
      `${Version.Plugin_Path}/resources/icons/image.svg`
    );
    const optionIcon = await loadImage(
      `${Version.Plugin_Path}/resources/icons/option.svg`
    );

    ctx.save();
    ctx.font = "20px SmileySans, NotoColorEmoji";
    ctx.fillStyle = "#333";
    ctx.textBaseline = "middle";

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const columnIndex = Math.floor(i / itemsPerColumn);
      const rowIndex = i % itemsPerColumn;
      const x = padding + columnIndex * (columnWidth + columnGap);
      const y = headerHeight + headerMarginBottom + rowIndex * rowHeight;
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.roundRect(x, y - 10, columnWidth, rowHeight + 20, 8);
      ctx.fill();
      ctx.restore();

      const index = i + 1;
      const text = `${index}. ${item.name}`;
      ctx.fillText(text, x + 16, y + rowHeight / 2);

      const iconSize = 18;
      const iconGap = 8;
      let iconX = x + columnWidth - 16;

      if (item.types.includes("option")) {
        iconX -= iconSize;
        ctx.drawImage(
          optionIcon,
          iconX,
          y + (rowHeight - iconSize) / 2,
          iconSize,
          iconSize
        );
        iconX -= iconGap;
      }
      if (item.types.includes("image")) {
        iconX -= iconSize;
        ctx.drawImage(
          imageIcon,
          iconX,
          y + (rowHeight - iconSize) / 2,
          iconSize,
          iconSize
        );
        iconX -= iconGap;
      }
      if (item.types.includes("text")) {
        iconX -= iconSize;
        ctx.drawImage(
          textIcon,
          iconX,
          y + (rowHeight - iconSize) / 2,
          iconSize,
          iconSize
        );
      }
    }

    ctx.restore();

    const buf = await canvas.toBuffer("image/png");
    return buf;
  },
  help: component.help,
};

/**
 * 用canvas绘制表情列表
 */

export { Render };
