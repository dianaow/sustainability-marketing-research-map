const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Replace with your Scopus API key
const apiKey = "efa2ffa3ff5de581ea2bdffa16ac9928"; // Replace with your Scopus API key

// Define the function to get citation count for a single DOI
async function getCitationCount(doi) {
  const url = `https://api.elsevier.com/content/abstract/doi/${doi}`;
  const headers = {
    "X-ELS-APIKey": apiKey,
    "Accept": "application/json",
  };

  try {
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      const citationCount = response.data?.["abstracts-retrieval-response"]?.coredata?.["citedby-count"] || "N/A";
      return { doi, citationCount };
    } else {
      return { doi, error: `Failed with status code: ${response.status}` };
    }
  } catch (error) {
    return { doi, error: error.response?.data || error.message };
  }
}

// Main function to process all DOIs
async function processDOIs() {
  // Read the list of DOIs from the JSON file
  const fileName = path.join(__dirname, 'src/data/final_papers_full.json');
  const data = fs.readFileSync(fileName, 'utf-8');
  const jsonData = JSON.parse(data);
  //console.log("Fetching citation counts...");

  for (const item of jsonData) {
    const result = await getCitationCount(item.DOI); // Fetch citation count for DOI
    item.citationCount = result.citationCount; // Assign the citation count to the corresponding object
    //console.log(`DOI: ${item.DOI}, Citation Count: ${result.citationCount}`);
  }

  // Save the results to a new JSON file
  const fileNameOutput = path.join(__dirname, 'src/data/final_papers_full_citations.json');
  fs.writeFileSync(fileNameOutput, JSON.stringify(jsonData, null, 2));
  //console.log("Results saved to citation_results.json");
}

// Run the main function
processDOIs();
