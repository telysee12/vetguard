import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('upload')
export class UploadController {
  @Post('passport-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) { // Only image files
          return cb(new HttpException('Only image files (JPG, JPEG, PNG) are allowed!', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
          console.log('Multer destination path:', uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileName = uniqueSuffix + extname(file.originalname);
          console.log('Saving file as:', fileName);
          cb(null, fileName);
        },
      }),
    }),
  )
  uploadPassportPhoto(@UploadedFile() file: any) {
    console.log('File received in uploadPassportPhoto:', file);
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`,
    };
  }

  // Keep existing general upload endpoint if needed, or remove if specific endpoints are preferred
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
          return cb(new HttpException('Only image and PDF files are allowed!', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
          console.log('Multer destination path (general upload):', uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileName = uniqueSuffix + extname(file.originalname);
          console.log('Saving file as (general upload):', fileName);
          cb(null, fileName);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    console.log('File received in uploadFile (general upload):', file);
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`,
    };
  }
}
