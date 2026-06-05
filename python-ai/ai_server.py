from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

print("Loading AI model...")

model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

print("Model loaded!")

@app.route("/similarity", methods=["POST"])
def similarity():
    data = request.json

    guess = data["guess"]
    target = data["target"]

    embeddings = model.encode([guess, target])

    score = cosine_similarity(
        [embeddings[0]],
        [embeddings[1]]
    )[0][0]

    percent = round(float(score) * 100, 2)

    return jsonify({
        "score": percent
    })
    
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)