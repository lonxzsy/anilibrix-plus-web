const fs = require('fs');
let data = fs.readFileSync('src/components/SubtitleOverlay.vue', 'utf8');
const old1 =           @click="
            style.position = p as any
            emitStyle()
          ";
const new1 =           @click="style.position = p as any; emitStyle()";
data = data.replace(old1, new1);
const old2 =           @click="
            style.align = a as any
            emitStyle()
          ";
const new2 =           @click="style.align = a as any; emitStyle()";
data = data.replace(old2, new2);
fs.writeFileSync('src/components/SubtitleOverlay.vue', data, 'utf8');
console.log('done');
