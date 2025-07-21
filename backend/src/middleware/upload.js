const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar diretório de uploads se não existir
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `candidato-${uniqueSuffix}${extension}`);
  }
});

// Filtro para validar tipos de arquivo
const fileFilter = (req, file, cb) => {
  // Tipos de arquivo permitidos
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // Verificar extensão
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Verificar mimetype
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const error = new Error('Tipo de arquivo inválido. Apenas imagens são permitidas');
    error.code = 'INVALID_FILE_TYPE';
    cb(error);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Middleware para upload de uma única imagem
const uploadSingle = upload.single('foto');

// Middleware personalizado para tratamento de erros do multer
const uploadMiddleware = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadMiddleware
};