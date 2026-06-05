import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, "..");
const tabsStylePath = resolve(
  packageRoot,
  "node_modules/wot-design-uni/components/wd-tabs/index.scss",
);

const invalidScrollbarBlock = `  @include when(hide-scrollbar) {
    ::-webkit-scrollbar {
      width: 0;
      height: 0;
      -webkit-appearance: none;
    }
  }

`;

try {
  const source = readFileSync(tabsStylePath, "utf8");
  if (!source.includes(invalidScrollbarBlock)) {
    process.exit(0);
  }

  writeFileSync(tabsStylePath, source.replace(invalidScrollbarBlock, ""), "utf8");
  console.log("[patch] Removed mp-weixin invalid scrollbar selector from wot-design-uni wd-tabs.");
} catch (error) {
  console.warn(`[patch] Skipped wot-design-uni wd-tabs patch: ${error.message}`);
}
