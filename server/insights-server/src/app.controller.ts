import { Controller, Header, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (file.mimetype.includes('sheet')) {
      const isValid = this.appService.validateExcel(file);
      console.log(`Arquivo Excel é ${isValid ? 'válido' : 'inválido'}`);
    } else {
      console.log('Tipo de arquivo não suportado');
    }
  }
}
