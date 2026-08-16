const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class UploadService {
  constructor() {
    this.provider = process.env.STORAGE_PROVIDER || 'local';
    
    if (this.provider === 's3') {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      this.bucketName = process.env.AWS_S3_BUCKET;
    } else {
      this.uploadDir = process.env.UPLOAD_DIR || 'uploads/';
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    }
  }

  async uploadFile(fileBuffer, originalName, mimetype) {
    const extension = path.extname(originalName);
    const uniqueFileName = `${uuidv4()}${extension}`;

    if (this.provider === 's3') {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: mimetype
      });

      await this.s3Client.send(command);
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    } else {
      const filePath = path.join(this.uploadDir, uniqueFileName);
      fs.writeFileSync(filePath, fileBuffer);
      return `/uploads/${uniqueFileName}`;
    }
  }
}

module.exports = new UploadService();
