// Script to generate iOS splash screens for PWA
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../public/splash');
const LOGO_PATH = path.join(__dirname, '../public/rnrdark.png'); // White logo
const BACKGROUND_COLOR = '#000000'; // Black

// iOS device splash screen sizes
// Format: [width, height, name, devicePixelRatio]
const SPLASH_SIZES = [
  // iPhone
  [1170, 2532, 'iphone-12-pro', 3], // iPhone 12 Pro, 13 Pro, 14
  [1284, 2778, 'iphone-12-pro-max', 3], // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
  [1179, 2556, 'iphone-14-pro', 3], // iPhone 14 Pro
  [1290, 2796, 'iphone-14-pro-max', 3], // iPhone 14 Pro Max
  [1125, 2436, 'iphone-x', 3], // iPhone X, XS, 11 Pro
  [1242, 2688, 'iphone-xs-max', 3], // iPhone XS Max, 11 Pro Max
  [828, 1792, 'iphone-xr', 2], // iPhone XR, 11
  [1080, 1920, 'iphone-8-plus', 3], // iPhone 6/7/8 Plus
  [750, 1334, 'iphone-8', 2], // iPhone 6/7/8, SE (2nd/3rd gen)
  [640, 1136, 'iphone-se', 2], // iPhone SE (1st gen), 5s

  // iPad
  [2048, 2732, 'ipad-pro-12', 2], // iPad Pro 12.9"
  [1668, 2388, 'ipad-pro-11', 2], // iPad Pro 11"
  [1668, 2224, 'ipad-pro-10', 2], // iPad Pro 10.5", Air (3rd gen)
  [1620, 2160, 'ipad-10', 2], // iPad 10.2" (7th-9th gen)
  [1536, 2048, 'ipad-9', 2], // iPad Air (1st/2nd), iPad mini (2nd-5th)
  [1488, 2266, 'ipad-mini-6', 2], // iPad mini (6th gen)
];

async function generateSplashScreens() {
  console.log('🍎 Generating iOS splash screens...\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get logo dimensions
  const logoMeta = await sharp(LOGO_PATH).metadata();
  console.log(`📐 Logo: ${logoMeta.width}x${logoMeta.height}\n`);

  for (const [width, height, name, dpr] of SPLASH_SIZES) {
    try {
      // Calculate logo size (about 30% of screen width, max 400px)
      const logoSize = Math.min(Math.round(width * 0.3), 400);

      // Resize logo
      const resizedLogo = await sharp(LOGO_PATH)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

      // Create splash screen with centered logo
      const outputPath = path.join(OUTPUT_DIR, `splash-${name}.png`);

      await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: BACKGROUND_COLOR,
        },
      })
        .composite([
          {
            input: resizedLogo,
            gravity: 'center',
          },
        ])
        .png()
        .toFile(outputPath);

      console.log(`✅ ${name}: ${width}x${height} (@${dpr}x)`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n🎉 iOS splash screens generated!\n');
  console.log('Add these to your layout.tsx <head>:');
  console.log('─'.repeat(50));

  // Generate link tags for each splash screen
  for (const [width, height, name, dpr] of SPLASH_SIZES) {
    const mediaWidth = width / dpr;
    const mediaHeight = height / dpr;
    console.log(
      `<link rel="apple-touch-startup-image" href="/splash/splash-${name}.png" media="(device-width: ${mediaWidth}px) and (device-height: ${mediaHeight}px) and (-webkit-device-pixel-ratio: ${dpr})" />`
    );
  }
}

generateSplashScreens().catch((err) => {
  console.error('Error generating splash screens:', err);
  process.exit(1);
});
