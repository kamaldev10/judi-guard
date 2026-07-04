FROM python:3.11

# Log Python langsung tampil (tidak di-buffer) — penting supaya log
# di panel Hugging Face Spaces muncul real-time, bukan tertahan.
ENV PYTHONUNBUFFERED=1

# Buat user non-root (rekomendasi resmi Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user --default-timeout=1000 -r requirements.txt

COPY --chown=user . .

EXPOSE 7860

# Gunicorn: server WSGI production-grade menggantikan `python app.py`.
# --workers 1  -> model TF (±250MB) dimuat sekali di memori; menambah
#                 worker akan menggandakan pemakaian RAM per proses.
# --threads 4  -> tetap bisa melayani beberapa request bersamaan dalam
#                 satu worker (I/O-bound seperti request masuk/keluar).
# --timeout 120 -> beri waktu cukup untuk inference model, hindari
#                  request di-kill prematur oleh Gunicorn.
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "4", "--timeout", "120", "app:app"]