const fs = require('fs');
const path = require('path');
let csvToJson = require('convert-csv-to-json');

let fileInputName = path.join(__dirname, 'src/data/scores_full.csv'); 
let fileOutputName = path.join(__dirname, 'src/data/scores_full.json');
let fileInputName1 = path.join(__dirname, 'src/data/final_papers_full.tsv'); 
let fileOutputName1 = path.join(__dirname, 'src/data/final_papers_full.json');

function tsvToJson(tsvFilePath, jsonFilePath) {
  fs.readFile(tsvFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    // Split the file content into lines
    const lines = data.trim().split('\n');

    // Extract headers from the first line
    const headers = lines[0].split('\t');

    // Process the remaining lines
    const jsonArray = lines.slice(1).map(line => {
      const values = line.split('\t');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });

    // Convert JSON array to string
    const jsonString = JSON.stringify(jsonArray, null, 2);

    // Write the JSON string to a file
    fs.writeFile(jsonFilePath, jsonString, 'utf-8', err => {
      if (err) {
        console.error('Error writing the JSON file:', err);
      } else {
        console.log('JSON file created successfully:', jsonFilePath);
      }
    });
  });
}

csvToJson.fieldDelimiter(',').generateJsonFileFromCsv(fileInputName,fileOutputName);
tsvToJson(fileInputName1, fileOutputName1);
