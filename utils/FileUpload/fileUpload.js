const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Function to create directory if not exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    // Get file extension
    const fileExt = path.extname(file.originalname).toLowerCase();

    // Define subfolders based on file type
    if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExt)) {
      uploadPath += "documents/";
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExt)) {
      uploadPath += "images/";
    } else if (file.mimetype === "text/csv") {
      uploadPath += "csv/";
    } else {
      uploadPath += "others/"; // Fallback folder
    }

    ensureDirExists(uploadPath); // Ensure the directory exists
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Allowed MIME types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "text/csv",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only CSV, PDFs, Docs, Text, and Images are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {fileSize: 5 * 1024 * 1024},
});

module.exports = upload;
