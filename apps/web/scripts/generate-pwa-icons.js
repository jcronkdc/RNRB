/**
 * Generate PWA Icons
 * Creates properly sized app icons with black background and white logo
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const PUBLIC_DIR = path.join(__dirname, '../public');
const LOGO_PATH = path.join(PUBLIC_DIR, 'rnrdark.png'); // White logo

const ICON_SIZES = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // iOS
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
];

const BACKGROUND_COLOR = '#000000'; // Pure black background
const PADDING_RATIO = 0.15; // 15% padding on each side

async function generateIcons() {
  console.log("🎸 Generating PWA icons for Rock N' Roll Basement...\n");

  // Check if logo exists
  if (!fs.existsSync(LOGO_PATH)) {
    console.error('❌ Logo file not found:', LOGO_PATH);
    process.exit(1);
  }

  // Get logo dimensions
  const logoMeta = await sharp(LOGO_PATH).metadata();
  console.log(`📐 Source logo: ${logoMeta.width}x${logoMeta.height}`);

  for (const { size, name } of ICON_SIZES) {
    const outputPath = path.join(PUBLIC_DIR, name);
    const padding = Math.round(size * PADDING_RATIO);
    const logoSize = size - padding * 2;

    try {
      // Resize logo maintaining aspect ratio
      const resizedLogo = await sharp(LOGO_PATH)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      // Create black background and composite logo centered
      await sharp({
        create: {
          width: size,
          height: size,
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

      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (err) {
      console.error(`❌ Failed to generate ${name}:`, err.message);
    }
  }

  console.log('\n🎉 PWA icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Add apple-touch-icon link in your layout');
  console.log('2. Update favicon links if needed');
}

generateIcons().catch(console.error);
