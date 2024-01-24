import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  removeFormatting(value: any): any {
    try {
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
    } catch (error) {
      // Handle any potential errors that might occur during formatting
      console.error(`Error in removeFormatting: ${error.message}`);
      throw new Error(error); // Return a error
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
    try {
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
    } catch (error) {
      // Handle any potential errors that might occur during date conversion
      console.error(`Error in convertDateFormat: ${error.message}`);
      throw new Error(error); // Return a error
    }
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
    const [dataAmv, dataAsc, cards] = this.getDataForAvmChart(jsonData);
    const [dataMrr, dataChurn] = this.getDataForMrrChart(jsonData)
    return {
      dataAmv,
      cards,
      dataAsc,
      dataChurn,
      dataMrr
    };
  }

  getDataForMrrChart(jsonData: any[]) {
    try {
      // Initialize data structures for MRR chart
      const data: { [key: number]: number } = {};
      const dataChrurnClientsActives: { [key: number]: number } = {};
      const occurrence: { [key: string]: number } = {};
      const controlKey: { [key: string]: number } = {};
    
      // Sort the JSON data by date
      const jsonDataSorted = jsonData.sort((a, b) => {
        const dateA = this.parseDateString(a[2]);
        const dateB = this.parseDateString(b[2]);
        return dateA.getTime() - dateB.getTime();
      });
    
      // Get the first and last elements of the sorted data
      const firstElement = jsonDataSorted[0];
      const lastElement = jsonDataSorted[jsonDataSorted.length - 1];
    
      // Get the months between the first and last date
      const monthsBetweenDates = this.getMonthsBetweenDates(firstElement[2], lastElement[2]);
    
      // Initialize a set of unique months
      let uniqueMonths: { [key: string]: boolean } = {};
      uniqueMonths = monthsBetweenDates.reduce((acc, month) => {
        acc[month] = false;
        return acc;
      }, {});
    
      // Process each row in the sorted JSON data
      jsonDataSorted.forEach(row => {
        const monthYear = this.extractMonthYear(row[2]);
        const canceledMonthYear = this.extractMonthYear(row[5]);
        let value = parseFloat(row[6]);
    
        // Convert annual values to monthly
        if (row[1] == 365) {
          value = value / 12;
        }
    
        const uniqueMonthsNow = { ...uniqueMonths };
        let summed = false;
    
        // Iterate through months and calculate MRR values
        for (let i = monthsBetweenDates.indexOf(monthYear); i < (monthsBetweenDates.length); i++) {
          const monthYearNow = monthsBetweenDates[i];
    
          // Break loop if canceled month is reached
          if (canceledMonthYear == monthYearNow) {
            break;
          } else {
            // Check if the month is unique and update MRR values
            if (uniqueMonthsNow[monthYearNow] == false) {
              if (data[monthYearNow]) {
                summed = true;
                data[monthYearNow] += value;
                dataChrurnClientsActives[monthYearNow]++;
              } else {
                summed = true;
                data[monthYearNow] = value;
                dataChrurnClientsActives[monthYearNow] = 0;
              }
              uniqueMonthsNow[monthYearNow] = true;
            }
          }

           // Update occurrence count for the current month
          if (summed) {
            if (!occurrence[monthYearNow]) {
              occurrence[monthYearNow] = 1;
            } else {
              occurrence[monthYearNow]++;
            }
          }
        }

        if (summed) {
          if (!controlKey[monthYear]) {
            controlKey[monthYear] = 1;
          } else {
            controlKey[monthYear]++;
          }
          summed = false;
        }
      });
    
      let previousKey: string = null;
      const dataChrurnClientsActivesClone = { ...dataChrurnClientsActives };
    
      // Calculate average values and churn rates
      Object.entries(data).forEach(([key, value]) => {
        
        const roundedValue = parseFloat(value.toFixed(2));
        const averageValue = roundedValue / (occurrence[key] ? occurrence[key] : occurrence[previousKey]);
        data[key] = { value: roundedValue, averageValue: averageValue };
        dataChrurnClientsActives[key] = { churn: this.calcularChurn(dataChrurnClientsActivesClone, key, previousKey) };
        
        if (controlKey[key] != null) {
          previousKey = key;
        } else {
          previousKey = key;
        }
      });
    
      // Sort keys for both MRR data and churn data
      const sortedKeys = Object.keys(data).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      });
    
      const sortedKeysChurn = Object.keys(dataChrurnClientsActives).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      });
    
      // Create sorted arrays for MRR data and churn data
      const sortedArray: { date: string; value: number; averageValue: number }[] = [];
      const sortedArrayChurn: { date: string; churn: number; }[] = [];
    
      sortedKeys.forEach((key) => {
        sortedArray.push({ date: key, ...data[key] });
      });
    
      sortedKeysChurn.forEach((key) => {
        sortedArrayChurn.push({ date: key, ...dataChrurnClientsActives[key] });
      });
    
      // Return both sorted arrays
      return [sortedArray, sortedArrayChurn];
    } catch (error) { 
      // Handle any potential errors that might occur during data processing
      console.error(`Error in getDataForMrrChart: ${error.message}`);
      throw new Error(error); // Return a error  
    }
  }
  


  getDataForAvmChart(jsonData: any[]) {
    try {
      // Initialize data structures for AVM chart
      const data: { [key: string]: number } = {};
      const monthlySum: any[] = [];
      const result: any[] = [];
      const occurrence: { [key: string]: number } = {};
      const canceled: { [key: string]: number } = {};
      let totalActiveContracts: number = 0;
      let totalCanceledContracts: number = 0;
      let totalActiveTicket: number = 0;
      let totalCanceledTicket: number = 0;
  
      // Sort the JSON data by date
      const jsonDataSorted = jsonData.sort((a, b) => {
        const dateA = this.parseDateString(a[2]);
        const dateB = this.parseDateString(b[2]);
        return dateA.getTime() - dateB.getTime();
      });
  
      // Process each row in the sorted JSON data
      jsonDataSorted.forEach((row) => {
        const monthYear = this.extractMonthYear(row[2]);
        const canceledMonthYear = this.extractMonthYear(row[5]);
        let value = parseFloat(row[6]);
  
        // Convert annual values to monthly
        if (row[1] == 365) {
          value = value / 12;
        }
  
        // Update totals for canceled contracts
        if (canceledMonthYear != null) {
          totalCanceledTicket += value;
          totalCanceledContracts++;
          if (!canceled[monthYear]) {
            canceled[monthYear] = 1;
          } else {
            canceled[monthYear]++;
          }
        }
  
        // Update totals and occurrence count for active contracts
        if (!occurrence[monthYear]) {
          totalActiveTicket += value;
          totalActiveContracts++;
          occurrence[monthYear] = 1;
          data[monthYear] = value;
        } else {
          totalActiveContracts++;
          occurrence[monthYear]++;
          data[monthYear] += value / occurrence[monthYear];
        }
      });
  
      // Create arrays for AVM chart data and monthly sum data
      Object.entries(data).forEach(([key, value]) => {
        const roundedValue = parseFloat(value.toFixed(2));
        monthlySum.push({ date: key, sold: occurrence[key], canceled: canceled[key] || 0 });
        result.push({ date: key, value: roundedValue });
      });
  
      // Sort arrays by date
      result.sort((a, b) => {
        const dateA = this.parseDateString(a['date']);
        const dateB = this.parseDateString(b['date']);
        return dateA.getTime() - dateB.getTime();
      });
  
      monthlySum.sort((a, b) => {
        const dateA = this.parseDateString(a['date']);
        const dateB = this.parseDateString(b['date']);
        return dateA.getTime() - dateB.getTime();
      });
  
      // Calculate average values per active and canceled contract
      const averageValuePerActiveContract = totalActiveTicket / totalActiveContracts;
      const averageValuePerCanceledContract = totalCanceledTicket / totalCanceledContracts;
  
      // Create an object with summary card data
      const cards = {
        averageValuePerActiveContract: averageValuePerActiveContract.toFixed(2),
        averageValuePerCanceledContract: averageValuePerCanceledContract.toFixed(2),
        totalActiveContracts: totalActiveContracts,
        totalCanceledContracts: totalCanceledContracts,
        totalActiveTicket: totalActiveTicket.toFixed(2),
        totalCanceledTicket: totalCanceledTicket.toFixed(2),
      }
  
      // Return arrays for AVM chart data, monthly sum data, and summary card data
      return [result, monthlySum, cards];
    } catch (error) {
      // Handle any potential errors that might occur during data processing
      console.error(`Error in getDataForAvmChart: ${error.message}`);
      throw new Error(error); // Return a error
    }
  }
  

  private extractMonthYear(dateString: string): string | null {
    try {
      // Function to extract month and year from a date string in the format "dd/mm/yyyy"
      if (dateString == null) {
        return null;
      }
      const [day, month, year] = dateString.split('/');
      const monthYear = `${month}/${year}`;
      return monthYear;
    } catch (error) {
      // Handle any potential errors during extraction
      console.error(`Error in extractMonthYear: ${error.message}`);
      throw new Error(error); // Return a error
    }
  }
  
  private parseDateString(dateString: string): Date {
    try {
      // Function to parse a date string in the format "dd/mm/yyyy" to a Date object
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}`);
    } catch (error) {
      // Handle any potential errors during date parsing
      console.error(`Error in parseDateString: ${error.message}`);
      throw new Error(error); // Return a error
    }
  }
  
  private getMonthsBetweenDates(startDate: string, endDate: string): string[] {
    try {
      // Function to get an array of month/year strings between two dates
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
    } catch (error) {
      // Handle any potential errors during month calculation
      console.error(`Error in getMonthsBetweenDates: ${error.message}`);
      throw new Error(error); // Return a error
    }
  }
  
  private calcularChurn(dataChrurnClientsActives: any, key: string, previousKey: string): number {
    try {
      // Function to calculate churn percentage
      if (dataChrurnClientsActives[key] >= dataChrurnClientsActives[previousKey]) {
        return 0;
      } else {
        let churn = (dataChrurnClientsActives[key] * 100) / (previousKey == null ? dataChrurnClientsActives[key] : dataChrurnClientsActives[previousKey]);
        if (churn == 100) {
          churn = 50;
        }
        return churn;
      }
    } catch (error) {
      // Handle any potential errors during churn calculation
      console.error(`Error in calcularChurn: ${error.message}`);
      throw new Error(error); // Return a error
    }
  }
}