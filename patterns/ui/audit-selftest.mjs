// Proves audit.mjs catches what it claims: one bad mock, three known defects.
import path from "node:path";
import { loadPlaywright } from "./playwright.mjs";
import { fileURLToPath } from "node:url";
import { mockDocument } from "./mock-doc.mjs";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = loadPlaywright();
const src = (await import("node:fs")).readFileSync(path.join(HERE, "audit.mjs"), "utf8");
const fnSrc = src.slice(src.indexOf("function inspect()"), src.indexOf("const HARD_COLOUR"));
const inspect = new Function(`${fnSrc}; return inspect();`);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 800 } });
await p.setContent(mockDocument(`<p style="color:#ccc">faint grey on white</p><div style="width:900px">too wide</div><p class="muted">fine muted</p>`, { theme: "light" }));
console.log(JSON.stringify(await p.evaluate(inspect), null, 1));
await p.setContent(mockDocument(`<div class="shell"><nav><a>Home</a></nav><div class="main"><div class="bar"><span>Title</span></div></div></div>`, { theme: "dark" }));
console.log(JSON.stringify(await p.evaluate(inspect)));
await b.close();
