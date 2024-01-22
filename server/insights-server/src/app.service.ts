import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  removeFormatting(value: any): any {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const formattedDate = this.convertDate(value);
      if (formattedDate !== value) {
        return formattedDate;
      }

      return this.removeHtmlMarkup(String(value));
    } else {
      return value;
    }
  }

  private removeHtmlMarkup(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }

  private convertDate(value: any): string | any {
    const dateFormats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{2}) (\d{1,2}):(\d{1,2})/,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    ];
  
    for (const dateFormat of dateFormats) {
      if (dateFormat.test(String(value))) {
        return this.convertDateFormat(value, dateFormat);
      }
    }
  
    return value;
  }
  
  private convertDateFormat(value: any, format: RegExp): string | any {
    const match = String(value).match(format);
    if (match) {
      const [_, ...groups] = match;

      if (match[0]?.length === 10) { 
        const year = groups[2]?.length === 2 ? Number(groups[2]) + 2000 : Number(groups[2] || new Date().getFullYear());
        const month = String(groups[1]).padStart(2, '0');
    
        return `${groups[0]}/${month}/${year}`;
      } else {
        const year = groups[2]?.length === 2 ? Number(groups[2]) + 2000 : Number(groups[2] || new Date().getFullYear());
        const month = String(groups[0]).padStart(2, '0');
    
        return `${groups[1]}/${month}/${year}`;
      }
    }
  
    return value;
  }
  
  validateExcel(jsonDataWithoutFormatting: any[]): { isValid: boolean; mismatchedColumns: string[] } {
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
    
    const firstRow = jsonDataWithoutFormatting[0];
  
    const mismatchedColumns: string[] = [];
  
    expectedColumns.forEach((col) => {
      const matchingValues = Object.values(firstRow).filter((value) => value === col);
      if (matchingValues.length === 0) {
        mismatchedColumns.push(col);
      }
    });
  
    const isValid = mismatchedColumns.length === 0;
  
    return { isValid, mismatchedColumns };
  }

  getDataForCharts(jsonData: any[]) {
    const [dataAvm, dataAsc, cards] = this.getDataForAvmChart(jsonData);
    return {
      dataAvm,
      cards,
      dataAsc,
      dataChurn: this.getDataForChurnChart(jsonData),
      dataMrr: this.getDataForMrrChart(jsonData)
    };
  }

  getDataForMrrChart(jsonData: any[]) {
    const data: { [key: number]: number } = {};
    const occurrence: { [key: string]: number } = {};

    const jsonDataSorted = jsonData.sort((a, b) => {
      const dateA = this.parseDateString(a[2]);
      const dateB = this.parseDateString(b[2]);
    
      return dateA.getTime() - dateB.getTime();
    });

    const firstElement = jsonDataSorted[0];
    const lastElement = jsonDataSorted[jsonDataSorted.length - 1];

    const monthsBetweenDates = this.getMonthsBetweenDates(firstElement[2], lastElement[2]);
    
    let uniqueMonths: { [key: string]: boolean } = {};
    uniqueMonths = monthsBetweenDates.reduce((acc, month) => {
      acc[month] = false;
      return acc;
    }, {});
    
    jsonDataSorted.forEach(row => {
      const monthYear = this.extractMonthYear(row[2]);
      const canceledMonthYear = this.extractMonthYear(row[5]);

      let value = parseFloat(row[6]);
  
      if (row[1] == 365) {
        value = value / 12;
      }  

      const uniqueMonthsNow = { ...uniqueMonths };
      let summed = false;
      for (let i = monthsBetweenDates.indexOf(monthYear); i < (monthsBetweenDates.length); i++) {
        const monthYearNow = monthsBetweenDates[i];
        if (canceledMonthYear == monthYearNow) {
          break;
        } else {
          if (uniqueMonthsNow[monthYearNow] == false) {
            if (data[monthYearNow]) {
              summed = true;
              data[monthYearNow] += value;
            } else {
              summed = true;
              data[monthYearNow] = value;
            }
            uniqueMonthsNow[monthYearNow] = true;
          }
        }
      }

      if (summed) {
        if (!occurrence[monthYear]) {
          occurrence[monthYear] = 1;
        } else {
          occurrence[monthYear]++;
        }
        summed = false;
      }
    });

    let previousKey: string = null;

    Object.entries(data).forEach(([key, value]) => {
      if (occurrence[key] != null) {
        previousKey = key;
      }
      const roundedValue = parseFloat(value.toFixed(2));
      const averageValue = roundedValue / (occurrence[key] ? occurrence[key] : occurrence[previousKey]);
      data[key] = { value: roundedValue, averageValue: averageValue };
    });

    const sortedKeys = Object.keys(data).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
    
      return dateA.getTime() - dateB.getTime();
    });
    
    const sortedArray: { date: string; value: number; averageValue: number }[] = [];

    sortedKeys.forEach((key) => {
      sortedArray.push({ date: key, ...data[key] });
    });

    return sortedArray;
  }
  
  

  getDataForChurnChart(jsonData: any[]) {
   return null;
  }

  getDataForAvmChart(jsonData: any[]) {
    const data: { [key: string]: number } = {};
    const monthlySum: any[] = [];
    const result: any[] = [];
    const occurrence: { [key: string]: number } = {};
    const canceled: { [key: string]: number } = {};
    let totalActiveContracts: number = 0;
    let totalCanceledContracts: number = 0;
    let totalActiveTicket: number = 0;
    let totalCanceledTicket: number = 0;
  
    const jsonDataSorted = jsonData.sort((a, b) => {
      const dateA = this.parseDateString(a[2]);
      const dateB = this.parseDateString(b[2]);
  
      return dateA.getTime() - dateB.getTime();
    });
  
    jsonDataSorted.forEach((row) => {
      const monthYear = this.extractMonthYear(row[2]);
      const canceledMonthYear = this.extractMonthYear(row[5]);
      let value = parseFloat(row[6]);
  
      if (row[1] == 365) {
        value = value / 12;
      }

  
      if (canceledMonthYear != null) {
        totalCanceledTicket += value;
        totalCanceledContracts++;
        if (!canceled[monthYear]) {
          canceled[monthYear] = 1;
        } else {
          canceled[monthYear]++;
        }
      }
  
      if (!occurrence[monthYear]) {
        totalActiveTicket += value;
        totalActiveContracts++;
        occurrence[monthYear] = 1;
        data[monthYear] = value;
      } else {
        occurrence[monthYear]++;
        data[monthYear] += value / occurrence[monthYear];
      }
    });
  
    Object.entries(data).forEach(([key, value]) => {
      const roundedValue = parseFloat(value.toFixed(2));
      monthlySum.push({date : key, sold : occurrence[key],  canceled : canceled[key] || 0});
      result.push({ year: key, value: roundedValue });
    });
  
    result.sort((a, b) => {
      const dateA = this.parseDateString(a['year']);
      const dateB = this.parseDateString(b['year']);
      return dateA.getTime() - dateB.getTime();
    });

    monthlySum.sort((a, b) => {
      const dateA = this.parseDateString(a['date']);
      const dateB = this.parseDateString(b['date']);
      return dateA.getTime() - dateB.getTime();
    });

    const averageValuePerActiveContract = totalActiveTicket / totalActiveContracts;
    const averageValuePerCanceledContract = totalCanceledTicket / totalCanceledContracts;

    const cards = {
      averageValuePerActiveContract: averageValuePerActiveContract.toFixed(2),
      averageValuePerCanceledContract: averageValuePerCanceledContract.toFixed(2),
      totalActiveContracts: totalActiveContracts,
      totalCanceledContracts: totalCanceledContracts,
      totalActiveTicket: totalActiveTicket.toFixed(2),
      totalCanceledTicket: totalCanceledTicket.toFixed(2),
    }
  
    return [result, monthlySum, cards];
  }

  private extractMonthYear(dateString: string) {
    if (dateString == null) {
      return null;
    }
    const [day, month, year] = dateString.split('/');
    const monthYear = `${month}/${year}`;
    return monthYear;
  }

  private parseDateString(dateString: string): Date {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
  }

  private getMonthsBetweenDates(startDate: string, endDate: string): string[] {
    const months: string[] = [];
    const startDateParts = startDate.split('/');
    const endDateParts = endDate.split('/');
  
    const startYear = parseInt(startDateParts[2]);
    const endYear = parseInt(endDateParts[2]);
    const startMonth = parseInt(startDateParts[1]) - 1;
    const endMonth = parseInt(endDateParts[1]) - 1;
  
    let currentDate = new Date(startYear, startMonth);
  
    while (currentDate <= new Date(endYear, endMonth)) {
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      const monthYear = `${month}/${year}`;
      months.push(monthYear);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months;
  }
}