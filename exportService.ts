
/**
 * Utility service to export data to CSV (Excel compatible format)
 */

export const ExportService = {
  downloadCSV: (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No data to export.");
      return;
    }

    // 1. Extract Headers
    const headers = Object.keys(data[0]);
    
    // 2. Convert Data to CSV String
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => headers.map(fieldName => {
        // Handle strings that might contain commas by wrapping in quotes
        const val = row[fieldName] ? row[fieldName].toString() : '';
        return `"${val.replace(/"/g, '""')}"`; 
      }).join(','))
    ].join('\r\n');

    // 3. Create Blob and Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
