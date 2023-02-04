const path = require('path');
let csvToJson = require('convert-csv-to-json');

let fileInputName = path.join(__dirname, 'src/data/scores.csv'); 
let fileOutputName = path.join(__dirname, 'src/data/scores.json');

csvToJson.fieldDelimiter(',').generateJsonFileFromCsv(fileInputName,fileOutputName);
