# app.py
from flask import Flask, render_template, request, jsonify 
from transformers import TFDistilBertForSequenceClassification, DistilBertTokenizerFast
import tensorflow as tf

app = Flask(__name__)

# --- Load Model ---
print("Memuat model dan tokenizer...")
try:
    model = TFDistilBertForSequenceClassification.from_pretrained("saved_model")
    tokenizer = DistilBertTokenizerFast.from_pretrained("saved_model")
    print("✅ Model dan tokenizer berhasil dimuat.")
except Exception as e:
    print(f"❌ Error memuat model: {e}")
    # Opsional: exit() jika model wajib ada

# --- Endpoint Lama ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict_for_web():
    text = request.form['input_text']
    res = get_prediction(text)
    return render_template('index.html', prediction=res['classification'], confidence=res['confidenceScore'], input_text=text)

@app.route('/api/predict', methods=['POST'])
def predict_for_api_single():
    json_data = request.get_json()
    if not json_data or 'text' not in json_data:
        return jsonify({"error": "Input JSON harus berisi key 'text'"}), 400
    return jsonify(get_prediction(json_data['text']))

# ==========================================
#  Batch Analysis
# ==========================================
@app.route('/api/analyze', methods=['POST'])
def analyze_batch():
    """
    Menerima list komentar dan mengembalikan hasil analisis massal.
    Format Input:
    {
        "comments": [
            { "id": "mongo_id_1", "text": "isi komentar 1" },
            { "id": "mongo_id_2", "text": "isi komentar 2" }
        ]
    }
    """
    try:
        json_data = request.get_json()
        
        # Validasi Input
        if not json_data or 'comments' not in json_data:
            return jsonify({"status": "error", "message": "Input harus memiliki array 'comments'"}), 400
        
        comments = json_data['comments']
        if not isinstance(comments, list):
            return jsonify({"status": "error", "message": "'comments' harus berupa list/array"}), 400

        results = []

        # Loop processing
        for item in comments:
            mongo_id = item.get('id')
            text = item.get('text', '')

            if not mongo_id: 
                continue

            prediction = get_prediction(text)

            results.append({
                "id": mongo_id,
                "classification": prediction['classification'],   # "JUDI" / "NON_JUDI"
                "confidenceScore": prediction['confidenceScore']
            })

        return jsonify({
            "status": "success",
            "total_processed": len(results),
            "results": results
        }), 200

    except Exception as e:
        print(f"Error di /api/analyze: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Helper Function  ---
def get_prediction(text: str) -> dict:
    # Handle text kosong/error
    if not text or not isinstance(text, str):
         return {"classification": "UNKNOWN", "confidenceScore": 0.0}

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