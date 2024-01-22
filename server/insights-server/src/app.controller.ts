import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as xlsx from 'xlsx';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (file.mimetype.includes('sheet')) {
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = xlsx.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: 'yyyy-mm-ddTHH:mm:ss.SSSZ',
          header: 1,
          defval: null,
          blankrows: false,
        });

        const jsonDataWithoutFormatting = jsonData.map((row: any, index: number) => {
          const newRow: any = {};
          for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
              newRow[key] = this.appService.removeFormatting(row[key]);
            }
          }
          return newRow;
        });

        const validationResults = this.appService.validateExcel(jsonDataWithoutFormatting);
        
        //Remove the first element with the column names
        jsonDataWithoutFormatting.shift();

        const dataForCharts = this.appService.getDataForCharts(jsonDataWithoutFormatting);

        if (validationResults.isValid) { 
          return { success: validationResults.isValid, jsonData: dataForCharts };
        } else {
          throw new Error('Invalid file type');
        }
      } else {
        throw new Error('Invalid file type');
      }
    } catch (error) {
      return { error: true, errors: [`Error during file processing: ${error.message}`] };
    }
  }
}
