const Jimp = require("jimp");
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const photosDir = path.join(__dirname, "../", "temp");
// const photosDir = path.join(__dirname, "../", "public", "photo");

const updatePhoto = async (photo) => {
  const { path: tempUpload, originalname } = photo;

  // Обробляємо файл
  const resizedImage = await sharp(tempUpload)
    .resize({ width: 700, height: 600, fit: "inside" })
    .toBuffer();

  sharp.cache(false);

  await fs.writeFile(tempUpload, resizedImage);

  return tempUpload;
};

const deletePhoto = async (file) => {
  await fs.unlink(file, (err) => {
    if (err) throw err;
  });
};

module.exports = { updatePhoto, deletePhoto };
