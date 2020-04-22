import players from '../data/PlayerNames.json';

let images = []
players.map(d=>{
  images.push({ name: d.Name, src: d.url }) 
})

export default images;