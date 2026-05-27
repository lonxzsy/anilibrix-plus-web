const fs = require('fs');
let c = fs.readFileSync('src/components/SubtitleOverlay.vue','utf8');
c = c.replace(/style\.position = p as any\r\n\s+emitStyle\(\)/, 'style.position = p as any; emitStyle()');
c = c.replace(/style\.align = a as any\r\n\s+emitStyle\(\)/, 'style.align = a as any; emitStyle()');
fs.writeFileSync('src/components/SubtitleOverlay.vue', c, 'utf8');
console.log('done');
