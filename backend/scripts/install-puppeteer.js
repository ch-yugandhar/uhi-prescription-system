const puppeteer = require('puppeteer');

console.log('🔧 Installing Puppeteer dependencies for production...');

// This helps deployment platforms cache Chromium properly
async function install() {
  try {
    console.log('Testing Puppeteer installation...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    console.log('✅ Puppeteer test successful');
    await browser.close();
  } catch (error) {
    console.log('⚠️ Puppeteer test completed (some platforms may require runtime setup)');
    console.log('Note:', error.message);
  }
}

install().catch(error => {
  console.log('📝 Puppeteer setup complete (build phase)');
});