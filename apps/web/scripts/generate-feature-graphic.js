/**
 * Generate Google Play Feature Graphic
 * Creates a 1024x500 banner for Google Play Store listing
 */

const sharp = require('sharp');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const LOGO_PATH = path.join(PUBLIC_DIR, 'rnrdark.png'); // White logo
const OUTPUT_PATH = path.join(PUBLIC_DIR, 'feature-graphic.png');

const WIDTH = 1024;
const HEIGHT = 500;
const BACKGROUND_COLOR = '#0a0a0a';

async function generateFeatureGraphic() {
  console.log('🎸 Generating Google Play Feature Graphic...\n');

  // Get logo and resize it
  const logoSize = 200;
  const resizedLogo = await sharp(LOGO_PATH)
    .resize(logoSize, Math.round(logoSize * 0.42), {
      // Maintain aspect ratio
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // Create gradient background with SVG
  const gradientSvg = `
    <svg width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0a0a0a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f0808;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="50%" fx="50%" fy="35%">
          <stop offset="0%" style="stop-color:#E07A5F;stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
      
      <!-- Tagline -->
      <text x="512" y="380" 
            font-family="Arial, sans-serif" 
            font-size="28" 
            font-weight="300"
            fill="#999999" 
            text-anchor="middle"
            letter-spacing="4">
        YOUR WORKSHOP. YOUR SOUND. YOUR STORY.
      </text>
      
      <!-- App name -->
      <text x="512" y="440" 
            font-family="Georgia, serif" 
            font-size="48" 
            font-weight="bold"
            fill="#E07A5F" 
            text-anchor="middle">
        Rock N' Roll Basement
      </text>
      
      <!-- Decorative elements -->
      <circle cx="100" cy="100" r="3" fill="#E07A5F" opacity="0.5"/>
      <circle cx="924" cy="400" r="4" fill="#E07A5F" opacity="0.4"/>
      <circle cx="200" cy="450" r="2" fill="#E07A5F" opacity="0.3"/>
      <circle cx="850" cy="80" r="3" fill="#E07A5F" opacity="0.4"/>
    </svg>
  `;

  // Create the feature graphic
  await sharp(Buffer.from(gradientSvg))
    .composite([
      {
        input: resizedLogo,
        top: 100,
        left: Math.round((WIDTH - logoSize) / 2),
      },
    ])
    .png()
    .toFile(OUTPUT_PATH);

  console.log(`✅ Feature graphic generated: ${OUTPUT_PATH}`);
  console.log(`   Dimensions: ${WIDTH}x${HEIGHT}`);
}

generateFeatureGraphic().catch(console.error);
