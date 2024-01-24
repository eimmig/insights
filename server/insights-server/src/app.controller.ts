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
      // Check if the uploaded file is a spreadsheet
      if (file.mimetype.includes('sheet')) {
        // Read the spreadsheet using the xlsx library
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the spreadsheet to a JSON object
        const jsonData = xlsx.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: 'yyyy-mm-ddTHH:mm:ss.SSSZ',
          header: 1,
          defval: null,
          blankrows: false,
        });

        // Remove specific formatting and get data for charts
        const jsonDataWithoutFormatting = jsonData.map((row: any, index: number) => {
          const newRow: any = {};
          for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
              newRow[key] = this.appService.removeFormatting(row[key]);
            }
          }
          return newRow;
        });

        // Validate the Excel file and get validation results
        const validationResults = this.appService.validateExcel(jsonDataWithoutFormatting);

        // Remove the first row of data (assuming it's a header)
        jsonDataWithoutFormatting.shift();

        // Get specific data for the charts to be displayed
        const dataForCharts = this.appService.getDataForCharts(jsonDataWithoutFormatting);

        // Return validation results and data for the charts
        if (validationResults.isValid) { 
          return { success: validationResults.isValid, jsonData: dataForCharts };
        } else {
          throw new Error('Invalid file type');
        }
      } else {
        throw new Error('Invalid file type');
      }
    } catch (error) {
      // Return error information if an exception occurs
      return { error: true, errors: [`Error during file processing: ${error.message}`] };
    }
  }
}
