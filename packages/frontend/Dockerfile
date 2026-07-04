FROM node:18-slim
WORKDIR /app
COPY package*.json ./

RUN rm -rf node_modules package-lock.json && npm install

# Memaksa pembangunan ulang (rebuild) khusus untuk library yang menggunakan bahasa native (seperti Tailwind)
RUN npm rebuild @tailwindcss/oxide

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]