const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

// Dijalankan sekali sebelum semua tes dimulai
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Dijalankan sekali setelah semua tes selesai
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Dijalankan sebelum setiap tes individu
beforeEach(async () => {
  // Membersihkan semua data di setiap koleksi untuk memastikan tes terisolasi
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
