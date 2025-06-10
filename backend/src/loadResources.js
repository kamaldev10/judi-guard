const mlService = require('./api/services/ai.service');

module.exports = async () => {
  console.log('⏳ Loading ML resources...');
  await mlService.initialize();
  console.log('✅ ML resources loaded');
};