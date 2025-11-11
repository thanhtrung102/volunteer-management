const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Resize và optimize image
 * @param {String} inputPath - Path của file input
 * @param {Object} options - Options {width, height, quality}
 * @returns {Promise<String>} - Path của file output
 */
exports.processImage = async (inputPath, options = {}) => {
  try {
    const {
      width = 800,
      height = 600,
      quality = 80,
      fit = 'cover'
    } = options;

    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, `-processed${ext}`);

    await sharp(inputPath)
      .resize(width, height, {
        fit: fit,
        withoutEnlargement: true
      })
      .jpeg({ quality: quality })
      .toFile(outputPath);

    // Xóa file gốc
    fs.unlinkSync(inputPath);

    return outputPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

/**
 * Tạo thumbnail
 * @param {String} inputPath - Path của file input
 * @param {Number} size - Kích thước thumbnail (default: 150)
 * @returns {Promise<String>} - Path của thumbnail
 */
exports.createThumbnail = async (inputPath, size = 150) => {
  try {
    const ext = path.extname(inputPath);
    const thumbnailPath = inputPath.replace(ext, `-thumb${ext}`);

    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover'
      })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
};

/**
 * Process avatar (resize to square)
 * @param {String} inputPath - Path của avatar
 * @returns {Promise<String>} - Path của processed avatar
 */
exports.processAvatar = async (inputPath) => {
  return exports.processImage(inputPath, {
    width: 200,
    height: 200,
    quality: 85,
    fit: 'cover'
  });
};

/**
 * Process event image
 * @param {String} inputPath - Path của event image
 * @returns {Promise<String>} - Path của processed image
 */
exports.processEventImage = async (inputPath) => {
  return exports.processImage(inputPath, {
    width: 1200,
    height: 800,
    quality: 80,
    fit: 'cover'
  });
};

/**
 * Process post image
 * @param {String} inputPath - Path của post image
 * @returns {Promise<String>} - Path của processed image
 */
exports.processPostImage = async (inputPath) => {
  return exports.processImage(inputPath, {
    width: 800,
    height: 600,
    quality: 75,
    fit: 'inside'
  });
};