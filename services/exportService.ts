
import { Territory, VisitStatus } from '../types';

// This function assumes the SheetJS (xlsx) library is loaded from a CDN.
declare var XLSX: any;

interface FlatVisitData {
  'Número Territorio': string;
  'Calle': string;
  'Número Casa': string;
  'Estado': VisitStatus;
  'Fecha': string;
  'Nombre': string;
  'Teléfono': string;
  'Observación': string;
}

export const exportTerritoryDataToExcel = (territory: Territory) => {
  const data: FlatVisitData[] = [];

  territory.streets.forEach(street => {
    street.houses.forEach(house => {
      house.visits.forEach(visit => {
        data.push({
          'Número Territorio': territory.number,
          'Calle': street.name,
          'Número Casa': house.number,
          'Estado': visit.status,
          'Fecha': new Date(visit.date).toLocaleString(),
          'Nombre': visit.name || '',
          'Teléfono': visit.phone || '',
          'Observación': visit.observation || '',
        });
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Territorio ${territory.number}`);

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => (row[key as keyof FlatVisitData] || '').toString().length)) + 2
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.writeFile(workbook, `Territorio_${territory.number}_Datos.xlsx`);
};
