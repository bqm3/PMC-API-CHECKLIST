const { parentPort, workerData } = require('worker_threads');
const sharp = require('sharp');

const { buffer, outputPath } = workerData;

sharp(buffer)
  .resize(488, 650, { fit: 'cover' })
  .jpeg({ quality: 90 })
  .toFile(outputPath)
  .then(() => parentPort.postMessage({ status: 'done' }))
  .catch((err) => parentPort.postMessage({ status: 'error', error: err.message }));