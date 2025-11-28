const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env') })

module.exports.secret = {
  port: process.env.PORT || 7000,
  env: process.env.NODE_ENV || 'development',
  db_url: process.env.MONGO_URI,
  token_secret: process.env.JWT_SECRET || process.env.TOKEN_SECRET,
  jwt_secret_for_verify: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET_FOR_VERIFY,

  email_service: process.env.SERVICE || 'gmail',
  email_user: process.env.SMTP_USER || process.env.EMAIL_USER,
  email_pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  email_host: process.env.HOST || 'smtp.gmail.com',
  email_port: process.env.EMAIL_PORT || 465, 

  cloudinary_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME, 
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY, 
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET, 
  cloudinary_upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned', 
  
  client_url: process.env.STORE_URL || 'http://localhost:3000', 
  admin_url: process.env.ADMIN_URL || 'http://localhost:3000/admin', 
}
