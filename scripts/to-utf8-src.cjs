const fs = require("fs");
const path = require("path");
function utf16beToStr(buf) {
  let s = "";
  for (let i = 0; i + 1 < buf.length; i += 2) {
    s += String.fromCharCode((buf[i] << 8) | buf[i + 1]);
  }
  return s;
}
function looksUtf16Be(buf) {
  if (buf.length < 6 || buf.length % 2 !== 0) return false;
  if (buf[0] === 0xfe && buf[1] === 0xff) return true;
  let ok = 0;
  const sample = Math.min(buf.length, 100);
  for (let i = 0; i + 1 < sample; i += 2) {
    if (buf[i] === 0 && buf[i + 1] >= 0x20 && buf[i + 1] < 0x7f) ok++;
  }
  return ok > 5;
}
function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p);
    else if (/\.(ts|tsx|css)$/.test(name.name)) {
      const buf = fs.readFileSync(p);
      let text;
      if (buf[0] === 0xfe && buf[1] === 0xff) text = utf16beToStr(buf.slice(2));
      else if (looksUtf16Be(buf)) text = utf16beToStr(buf);
      else text = buf.toString("utf8");
      fs.writeFileSync(p, text, "utf8");
    }
  }
}
walk(path.join(__dirname, "..", "src"));
console.log("src utf-8 ok");
