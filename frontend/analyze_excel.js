
const XLSX = require('xlsx');
const path = require('path');

const filePath = 'c:\\Users\\burak\\OneDrive\\Belgeler\\Cantam_Butik\\Shopier-Urunler-20260217.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

if (jsonData.length > 0) {
    console.log('Headers:', JSON.stringify(jsonData[0], null, 2));
    if (jsonData.length > 1) {
        console.log('First Row:', JSON.stringify(jsonData[1], null, 2));
        console.log('Second Row:', JSON.stringify(jsonData[2], null, 2));
    }
} else {
    console.log('Empty Excel file');
}
