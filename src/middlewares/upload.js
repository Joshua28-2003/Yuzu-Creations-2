const path = require('path');
const fs = require('fs');
const multer = require('multer');

const root = path.join(__dirname, '..', '..');
const uploadDir = path.resolve(root, process.env.UPLOAD_DIR || 'public/uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/vnd.wave',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/webm',
  'audio/aac',
  'audio/x-aac',
];

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v', 'video/3gpp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function makeUploader({ allowed, envKey, defaultMb }) {
  const maxMb = Number(process.env[envKey]) || defaultMb;
  return multer({
    storage,
    limits: { fileSize: maxMb * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (allowed.includes(file.mimetype)) return cb(null, true);
      return cb(new Error(`Unsupported file type: ${file.mimetype || 'unknown'}`));
    },
  });
}

const image = makeUploader({ allowed: IMAGE_TYPES, envKey: 'MAX_UPLOAD_MB', defaultMb: 5 });
const audio = makeUploader({ allowed: AUDIO_TYPES, envKey: 'MAX_AUDIO_MB', defaultMb: 20 });
const video = makeUploader({ allowed: VIDEO_TYPES, envKey: 'MAX_VIDEO_MB', defaultMb: 200 });

module.exports = { image, audio, video, uploadDir };