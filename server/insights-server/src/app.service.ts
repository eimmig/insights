import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class AppService {
  validateExcel(file: Express.Multer.File): boolean {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      const expectedColumns = [
        'quantidade cobranças',
        'cobrada a cada X dias',
        'data início',
        'status',
        'data status',
        'data cancelamento',
        'valor',
        'próximo ciclo',
        'ID assinante',
      ];

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const columns = Object.keys(sheet);
      const areColumnsValid = expectedColumns.every((col) => columns.includes(col));
      
      return areColumnsValid;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
