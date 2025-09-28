# Impor 'jsonify' dan 'request' dari flask
from flask import Flask, render_template, request, jsonify 
from transformers import TFDistilBertForSequenceClassification, DistilBertTokenizerFast
import tensorflow as tf

app = Flask(__name__)

# Load model dan tokenizer (tetap sama)
print("Memuat model dan tokenizer...")
model = TFDistilBertForSequenceClassification.from_pretrained("saved_model")
tokenizer = DistilBertTokenizerFast.from_pretrained("saved_model")
print("✅ Model dan tokenizer berhasil dimuat.")

# --- Endpoint untuk antarmuka web ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict_for_web():
    text = request.form['input_text']
    
    # Logika prediksi (diekstrak ke fungsi sendiri agar bisa dipakai ulang)
    prediction_result = get_prediction(text)

    # Kirim hasil ke template HTML
    return render_template(
        'index.html',
        prediction=prediction_result['classification'],
        confidence=prediction_result['confidenceScore'],
        input_text=text
    )

# --- Endpoint untuk dikonsumsi oleh backend lain (API) ---
@app.route('/api/predict', methods=['POST'])
def predict_for_api():
    """Endpoint ini menerima JSON dan mengembalikan JSON."""
    # Ambil data dari body JSON request
    json_data = request.get_json()
    if not json_data or 'text' not in json_data:
        return jsonify({"error": "Input JSON harus berisi key 'text'"}), 400

    text = json_data['text']
    
    # Panggil fungsi prediksi
    prediction_result = get_prediction(text)

    # Kembalikan hasil dalam format JSON
    return jsonify(prediction_result)

def get_prediction(text: str) -> dict:
    """Fungsi helper untuk melakukan tokenisasi dan prediksi."""
    # Tokenisasi
    inputs = tokenizer(text, return_tensors="tf", truncation=True, padding='max_length', max_length=128)

    # Prediksi
    outputs = model(inputs)
    probs = tf.nn.softmax(outputs.logits, axis=1)
    pred_index = tf.argmax(probs, axis=1).numpy()[0]
    confidence = tf.reduce_max(probs).numpy()

    # Label mapping
    label_map = {0: "NON_JUDI", 1: "JUDI"}
    predicted_label = label_map.get(pred_index, "Tidak Dikenal")
    
    return {
        "classification": predicted_label,
        "confidenceScore": round(float(confidence), 4)
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)