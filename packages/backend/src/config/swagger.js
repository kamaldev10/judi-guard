import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Judi Guard API',
      version: '2.0.0',
      description: `API Backend untuk platform **Judi Guard** — deteksi dan moderasi konten perjudian pada komentar YouTube.

## Fitur Utama
- Autentikasi JWT + Google OAuth
- Manajemen Workspace multi-tenant dengan RBAC
- Analisis komentar video YouTube (AI + rule-based hybrid scoring)
- Moderasi komentar (hapus langsung via YouTube API)
- Whitelist/Blacklist channel & keyword
- Laporan PDF (periodik & per analisis)
`,
      contact: {
        name: 'Judi Guard Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: 'https://judi-guard.onrender.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan token JWT yang didapat dari endpoint login/register',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Deskripsi error' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoint' },
      { name: 'Auth', description: 'Autentikasi & Otorisasi' },
      { name: 'Users', description: 'Manajemen profil user' },
      { name: 'Analysis', description: 'Analisis komentar video' },
      { name: 'Channels', description: 'Channel & video YouTube' },
      { name: 'Configuration', description: 'Whitelist & Blacklist' },
      { name: 'Workspace', description: 'Manajemen workspace & anggota' },
      { name: 'Studio', description: 'Integrasi YouTube Studio' },
      { name: 'Text Predict', description: 'Prediksi teks tunggal' },
    ],
  },
  apis: ['./src/modules/**/*.controller.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
