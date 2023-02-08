const path = require('path');
let csvToJson = require('convert-csv-to-json');

let fileInputName = path.join(__dirname, 'src/data/scores_overall.csv'); 
let fileOutputName = path.join(__dirname, 'src/data/scores_overall.json');

csvToJson.fieldDelimiter(',').generateJsonFileFromCsv(fileInputName,fileOutputName);
