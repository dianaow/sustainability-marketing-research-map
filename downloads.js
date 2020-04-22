const https= require('https');
const fs = require('fs');
const path = require('path');
const parseCSV  = require('csv-parse/lib/sync');

const csv = parseCSV(fs.readFileSync(path.join(__dirname, 'src/data/PlayerNames.csv'), 'utf8'), { columns: true });
const json = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/soccer_player_scores.json'), 'utf8'));

json.forEach(player=>{
  let p = csv.find(d=>player['Name'].indexOf(d['Name'].split(" ")[1]) != -1 | player['Name'].indexOf(d['Name']) != -1)
  player.url = p ? "./" + p['Name'] + '.png' : ""
})

fs.writeFile(path.join(__dirname, 'src/data/soccer_player_scores1.json'), JSON.stringify(json), function(err) {
    if(err) {
        return console.log(err);
    }
    return console.log("json was updated");
}); 