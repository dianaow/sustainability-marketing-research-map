const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const axios = require('axios');
const mammoth = require("mammoth");

require('dotenv').config();

const app = express();

app.use(cors()); // Enable CORS for all routes

const PORT = process.env.PORT || 3001;

const tooltipFile = "src/data/Tooltips.docx"
const bibliographyFile = "src/data/Bibliography_EmpiricalSample.docx"  // Directory where papers (in tsv) are stored
const PAPER_DIR = "src/data/papers"; // Directory where papers (in tsv) are stored
const SCORE_DIR = "src/data/scores"; // Directory where scores (in csv) are stored
const apiKey = process.env.apiKey

class ScopusAPI {
  constructor(apiKey) {
      this.apiKey = apiKey;
      this.baseUrl = 'https://api.elsevier.com/content/search/scopus';
      this.headers = {
          'Accept': 'application/json',
          'X-ELS-APIKey': this.apiKey,
          'Content-Type': 'application/json'
      };
  }

  async searchDOIs(dois) {
      // Construct query with OR operators
      const query = dois.map(doi => `DOI(${doi})`).join(' OR ');
      
      try {
          const response = await axios.get(this.baseUrl, {
              headers: this.headers,
              params: {
                  query: query,
                  field: 'citedby-count,doi,title',
                  count: 20  // Number of results per page
              }
          });

          // Process results and match them back to input DOIs
          const results = new Map();
          dois.forEach(doi => {
              results.set(doi, {
                  doi,
                  status: 'not_found',
                  citationCount: 0
              });
          });

          if (response.data['search-results']?.entry) {
              response.data['search-results'].entry.forEach(entry => {
                  const doi = entry['prism:doi'];
                  results.set(doi, {
                      doi: doi,
                      title: entry['dc:title'],
                      citationCount: entry['citedby-count'],
                      status: 'success'
                  });
              });
          }

          return Array.from(results.values());

      } catch (error) {
          console.error('API Error:', error.message);
          // Return error status for all DOIs in this batch
          return dois.map(doi => ({
              doi,
              status: 'error',
              error: error.message,
              citationCount: 0
          }));
      }
  }

  async batchSearch(dois, batchSize = 20) {  // Increased batch size since we're doing fewer requests
      const results = [];
      const batches = [];

      // Split DOIs into batches
      for (let i = 0; i < dois.length; i += batchSize) {
          batches.push(dois.slice(i, i + batchSize));
      }

      // Process each batch
      for (const [index, batch] of batches.entries()) {
          console.log(`Processing batch ${index + 1}/${batches.length} (${batch.length} DOIs)`);
          
          try {
              const batchResults = await this.searchDOIs(batch);
              results.push(...batchResults);

              // Add a small delay between batches to be nice to the API
              if (index < batches.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 500));
              }
          } catch (error) {
              console.error(`Error processing batch ${index + 1}:`, error.message);
              // Continue with next batch even if one fails
          }
      }

      return results;
  }
}
// // Function to get citation count for a single DOI
// async function getCitationCount(doi) {
//   const url = `https://api.elsevier.com/content/abstract/doi/${doi}`;
//   const headers = {
//     "X-ELS-APIKey": apiKey,
//     "Accept": "application/json",
//   };

//   try {
//     const response = await axios.get(url, { headers });
//     if (response.status === 200) {
//       const citationCount = response.data?.["abstracts-retrieval-response"]?.coredata?.["citedby-count"] || "N/A";
//       return { doi, citationCount };
//     } else {
//       return { doi, error: `Failed with status code: ${response.status}` };
//     }
//   } catch (error) {
//     return { doi, error: error.response?.data || error.message };
//   }
// }

// Function to parse metadata of papers in TSV format, then extract citation count for each paper and save as JSON
const importPapers = async (directory) => {
  return new Promise((resolve, reject) => {
    let allData = [];

    fs.readdir(directory, (err, files) => {
      if (err) {
        reject("Error reading directory: " + err.message);
        return;
      }

      let fileReadPromises = files.map((file, index) => {
        return new Promise((res, rej) => {
          let fileData = [];
          const filePath = path.join(directory, file);

          if (file.endsWith(".tsv")) {
            // Process TSV files
            fs.readFile(filePath, "utf-8", (err, data) => {
              if (err) {
                console.error("Error reading TSV file:", err);
                rej(err);
                return;
              }

              const lines = data.trim().split("\n");
              const headers = lines[0].split("\t");

              lines.slice(1).forEach((line) => {
                const values = line.split("\t");
                let obj = {};
                headers.forEach((header, index) => {
                  obj[header] = values[index];
                });

                obj.sourceFile = index;
                fileData.push(obj);
              });

              allData = [...allData, ...fileData];
              res();
            });
          }
        });
      });

      Promise.all(fileReadPromises)
        .then(async () => {

          // Initialize API client and process DOIs
          const scopus = new ScopusAPI(apiKey);
          
          const dois = allData.map(d => d.DOI)

          const results = await scopus.batchSearch(dois);

          for (const item of allData) {
            if (item.DOI) {
              const result = results.find(d => d.doi === item.DOI)
              item.citationCount = result.citationCount;
            }
          }

          // for (const item of allData) {
          //   if (item.DOI) {
          //     const result = await getCitationCount(item.DOI); // Fetch citation count
          //     item.citationCount = result.citationCount;
          //   }
          // }

          // Save to JSON file
          const fileNameOutput = path.join(__dirname, "src/data/output/final_papers_full_citations.json");
          fs.writeFileSync(fileNameOutput, JSON.stringify(allData, null, 2));
          //console.log("JSON file saved successfully:", fileNameOutput);

          resolve(allData);
        })
        .catch((error) => reject(error));
    });
  });
};

const columnMapping = {
  "Are Consumers addressed as Actors in this research?": "Act_Cons",
  "Are Consumers Self-Oriented in this article?": "Cons_Self",
  "Are Consumers Societally-Oriented in this article?": "Cons_Soc",
  "Are Consumers Environmentally-Oriented in this article?": "Cons_Env",
  "Are Businesses addressed as Actors in this research?": "Act_Busi",
  "Are Businesses Profit-Oriented in this article?": "Busi_Prof",
  "Are Businesses Societally-Oriented in this article?": "Busi_Soc",
  "Are Businesses Environmentally-Oriented in this article?": "Busi_Env",
  "Are Institutions addressed as Actors in this research?": "Act_Inst", 
  "Are Institutions Growth-Oriented in this article?": "Inst_Gro",
  "Are Institutions Societally-Oriented in this article?": "Inst_Soc",
  "Are Institutions Environmentally-Oriented in this article?": "Inst_Env",
  "What is the Scope of Sustainability in this article?": "SP"
};

const transformRow = (row) => {
  let transformedRow = {};

  Object.entries(row).forEach(([key, value]) => {
    // Convert "Yes" → 1 and "No" → 0
    let newValue = value === "Yes" ? 1 : value === "No" ? 0 : value;

    // Rename column if it exists in mapping, otherwise keep the original name
    let newKey = columnMapping[key] || key;

    transformedRow[newKey] = newValue;
  });

  return transformedRow;
};

// Function to parse metadata of scores for papers in CSV format, perform data transformation and save as JSON
const importScores = async (directory) => {
  return new Promise((resolve, reject) => {
    let allData = [];

    fs.readdir(directory, (err, files) => {
      if (err) {
        reject("Error reading directory: " + err.message);
        return;
      }

      let fileReadPromises = files.map((file, index) => {
        return new Promise((res, rej) => {
          let fileData = [];
          const filePath = path.join(directory, file);

          if (file.endsWith(".csv")) {
            // Process CSV files
            fs.createReadStream(filePath)
              .pipe(csv())
              .on("data", (row) => {
                let transformedRow = transformRow(row);
                transformedRow.sourceFile = index;
                fileData.push(transformedRow);
              })
              .on("end", () => {
                allData = [...allData, ...fileData];
                res();
              })
              .on("error", (error) => rej(error));
          } 
        });
      });

      Promise.all(fileReadPromises)
        .then(async () => {
          // Save to JSON file
          const fileNameOutput = path.join(__dirname, "src/data/output/scores_full.json");
          fs.writeFileSync(fileNameOutput, JSON.stringify(allData, null, 2));
          //console.log("JSON file saved successfully:", fileNameOutput);

          resolve(allData);
        })
        .catch((error) => reject(error));
    });
  });
};

// Function to parse bibliography from each paragraph in word document 
const importBibliography = async(filePath) => {
  try {
    // Read the DOCX file as a buffer
    const buffer = fs.readFileSync(filePath);

    // Extract text from the DOCX file
    const { value } = await mammoth.extractRawText({ buffer });

    // Split text into paragraphs
    const paragraphs = value.split("\n").filter(p => p.trim() !== "");

    return paragraphs;
  } catch (error) {
    console.error("Error reading DOCX file:", error);
    return [];
  }
}

// Function to parse tooltip content from each paragraph in word document 
const importTooltipContent = async (filePath) => {
  try {
    // Read the DOCX file as a buffer
    const buffer = fs.readFileSync(filePath);

    // Extract text from the DOCX file
    const { value } = await mammoth.extractRawText({ buffer });

    // Split text into paragraphs
    const paragraphs = value.split("\n").filter(p => p.trim() !== "");
 
    const sections = {
      "Actors": [],
      "Value Orientations": [],
      "Scope of Sustainability": []
    };
    
    let currentKey = null;

    paragraphs.forEach(paragraph => {
      const normalized = paragraph.trim();

      if (sections.hasOwnProperty(normalized)) {
        currentKey = normalized;  // Update the current section key
      } else if (currentKey) {
        sections[currentKey].push(paragraph);  // Assign paragraph to the correct section
      }
    });

    return sections;
  } catch (error) {
    console.error("Error reading DOCX file:", error);
    return {};
  }
};


// API route to fetch transformed data
app.get("/api/data", async (req, res) => {
  try {
    const papers = await importPapers(PAPER_DIR);
    const scores = await importScores(SCORE_DIR);
    const bibliography = await importBibliography(bibliographyFile)
    const tooltipContent = await importTooltipContent(tooltipFile)

    console.log("Processed Papers:", papers.length, "items");
    console.log("Processed Scores:", scores.length, "items");
    console.log("Processed Biblography:", bibliography.length, "items");
    console.log("Processed Tooltip:", Object.values(tooltipContent).length, "items");

    res.json({ papers, scores, bibliography, tooltipContent });
  } catch (error) {
    console.error("Error reading JSON file:", error.message);
    res.status(500).json({ error: "Failed to read JSON file." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
