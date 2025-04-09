
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

async function analyzeImage(imageBuffer) {
  try {
    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations;
    console.log('Text found:', detections);
    return detections;
  } catch (err) {
    console.error('Error during vision API call:', err);
  }
}

module.exports = { analyzeImage };
