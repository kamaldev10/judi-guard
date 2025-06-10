//src/core/model-loader.js
const tf = require("@tensorflow/tfjs-node");
const path = require("path");

let isModelLoading = false;
let model = null;

async function loadModel() {
  if (model) return model;
  if (isModelLoading) {
    throw new Error("Model sedang di-load oleh request lain");
  }

  isModelLoading = true;
  try {
    const modelPath = path.join(__dirname, "..", "models", "tfjs-model");
    model = await tf.loadGraphModel(`file://${modelPath}/model.json`);

    // Warm-up model
    const dummyInput = tf.zeros([1, 128]); // Sesuaikan dengan input shape
    await model.predict(dummyInput).data();
    dummyInput.dispose();

    return model;
  } finally {
    isModelLoading = false;
  }
}

module.exports = { loadModel };
