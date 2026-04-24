import fs from 'fs';
import https from 'https';
import path from 'path';

const MODELS_URL_BASE = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const models = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
];

const dir = path.join(process.cwd(), 'public', 'models');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

console.log('Downloading models to', dir);

models.forEach(model => {
    const dest = path.join(dir, model);
    if (!fs.existsSync(dest)) {
        console.log(`Downloading ${model}...`);
        const file = fs.createWriteStream(dest);
        https.get(`${MODELS_URL_BASE}/${model}`, function (response) {
            if (response.statusCode !== 200) {
                console.error('Failed to download', model, 'Status:', response.statusCode);
            }
            response.pipe(file);
            file.on('finish', function () {
                file.close();
                console.log(`Downloaded ${model}`);
            });
        }).on('error', function (err) {
            fs.unlink(dest, () => { });
            console.error('Error downloading', model, err);
        });
    } else {
        console.log(`${model} already exists.`);
    }
});
