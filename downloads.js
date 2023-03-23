const path = require('path');
let csvToJson = require('convert-csv-to-json');

let fileInputName = path.join(__dirname, 'src/data/scores_overall.csv'); 
let fileOutputName = path.join(__dirname, 'src/data/scores_overall.json');
let fileInputName1 = path.join(__dirname, 'src/data/final_papers.csv'); 
let fileOutputName1 = path.join(__dirname, 'src/data/final_papers.json');

csvToJson.fieldDelimiter(',').generateJsonFileFromCsv(fileInputName,fileOutputName);
csvToJson.fieldDelimiter(',').generateJsonFileFromCsv(fileInputName1,fileOutputName1);