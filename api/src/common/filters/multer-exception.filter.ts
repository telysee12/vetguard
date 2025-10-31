import { Catch, ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'File upload error';

    if (exception.code === 'LIMIT_FILE_SIZE') {
      status = HttpStatus.PAYLOAD_TOO_LARGE;
      message = 'File too large. Maximum size is 10MB.';
    } else if (exception.code === 'LIMIT_UNEXPECTED_FILE') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Unexpected field for file upload.';
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
