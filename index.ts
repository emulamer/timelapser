import fs from 'fs';
import path from 'path';
import {execSync} from 'child_process';

const IMG_PATH = "/home/pi/phogrows";
const TMP_PATH = path.join(__dirname, ".tmp");
if (!fs.existsSync(TMP_PATH)) {
    fs.mkdirSync(TMP_PATH);
}
const files = fs.readdirSync(IMG_PATH).filter(x=> x.startsWith("auto_") && x.endsWith(".png")).sort();
const cleanupFiles = [];
try {
    let ctr = 0;
    for (let f of files) {
        const tmpFile = path.join(TMP_PATH, `img${ctr}.png`);
        fs.linkSync(path.join(IMG_PATH, f), tmpFile);
        cleanupFiles.push(tmpFile);
        ctr++;
    }
    console.log(execSync(`ffmpeg -r 1 -y -threads 2 -f image2 -i img%d.png -vf scale=1920:1080 -vcodec h264_omx -b:v 2048k out.mp4`, { cwd: TMP_PATH }));
    execSync(`mv '${path.join(TMP_PATH, "out.mp4")}' /home/pi/phogrows/timelapse.mp4`);
} finally {
    for (let f of cleanupFiles) {
        console.log("unlinking " + f);
        fs.unlinkSync(f);
    }
}


