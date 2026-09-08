const { match } = require("../../dist");

const BASE_TEXT =
  "汉语拼音是中文信息处理的基础能力之一，多音字识别和自定义词典导入。";

const TEXTS = [
  { name: "33chars", text: BASE_TEXT },
  { name: "132chars", text: BASE_TEXT.repeat(4) },
  { name: "528chars", text: BASE_TEXT.repeat(16) },
];

const QUERIES = [
  { name: "pinyin-short", query: "hanyu" },
  { name: "pinyin-long", query: "hanyupinyinshizhongwenxinxichuli" },
  { name: "initials", query: "hypy" },
  { name: "late-fail", query: "hanyupinyinshizhongwenxinxichulixyz" },
];

const PRECISIONS = ["first", "start", "every"];
const iterations = Number(process.env.BENCH_ITERATIONS || 500);
const warmup = Number(process.env.BENCH_WARMUP || 50);

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function measure(fn) {
  for (let i = 0; i < warmup; i++) {
    fn();
  }

  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    fn();
    samples.push(Number(process.hrtime.bigint() - start) / 1e6);
  }

  return median(samples);
}

console.log(`Node ${process.version}`);
console.log(`iterations: ${iterations} (+ ${warmup} warmup)\n`);
console.log("precision | text     | query          | median(ms)");
console.log("----------|----------|----------------|-----------");

for (const precision of PRECISIONS) {
  for (const { name: textName, text } of TEXTS) {
    for (const { name: queryName, query } of QUERIES) {
      const result = measure(() => match(text, query, { precision }));
      console.log(
        `${precision.padEnd(10)}| ${textName.padEnd(9)}| ${queryName.padEnd(15)}| ${result.toFixed(3).padStart(10)}`,
      );
    }
  }
}
