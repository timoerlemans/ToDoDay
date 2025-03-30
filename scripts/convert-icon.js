const sharp = require('sharp');
const path = require('path');

sharp(path.join(__dirname, '../projects/tododay/src/assets/icons/apple-touch-icon.svg'))
  .resize(180, 180)
  .png()
  .toFile(path.join(__dirname, '../projects/tododay/src/assets/icons/apple-touch-icon.png'))
  .then(() => console.log('Icon converted successfully'))
  .catch(err => console.error('Error converting icon:', err));
