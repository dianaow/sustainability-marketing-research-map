## FIFA 19 Players Data Visualization

### Visualizing high-level score attributes and connections of players registered in the FIFA 19 (football simulation video game) database.

Data source: <https://www.kaggle.com/karangadiya/fifa19> (Data scraped from <https://sofifa.com/>)

Detailed attributes for all 18,207 player registered in football simulation video game 'FIFA 19' is made available on the website sofifa.com. Players are scored according to 6 categories representing their abilities. An overall score is formulated for each player based on these category scores (ie. sub-score) amongst other parameters. Initially, I wanted to visualize each sub-score per player in a radar chart. This caused clutter as each player has 6 times the number of elements to render. Hence, I decided that it would more useful to only show one node per player and place that node in the category which he has the highest score in. Hence, the 'radar scatter' chart was conceptualized to visualize a player's highest sub-score alongside his overall score.

### [Live Demo](http://fifa19-viz.s3-website-ap-southeast-1.amazonaws.com/)

<b>1. Filter players by overall score using a slider</b>
- The players visualized on the plot can be narrowed down using a slider which filters the players by their overall score. The toggle buttons are 'aware' of the updated state and when clicked, the filtered range of nodes transition accordingly. I have decided to pre-set a filter of players with overall scores above 0.7.

![alt text](https://github.com/dianaow/fifa-viz/raw/master/fifa19_2_new.gif "Demo Feature 2")

<b>2. Select a player to see detailed view of his statistics and connections using hover effect</b>
- To see a detailed view of a player's statistics and connections (other players on the same team), hover over his node. A player can also be searched for using the search bar.

![alt text](https://github.com/dianaow/fifa-viz/raw/master/fifa19_searched.png "Demo Feature 3")

<b>3. Transition to binned scores</b>
- As there are many individual graphic elements on the chart, I have chosen to provide another view with scores binned. However, I still wanted to keep the individual elements to enable the user to locate a player on the chart and easily see his statistics. Hence, the toggle buttons enable the user to switch between the two views, with a transition effect created to make 'individual' nodes appear to coalesce into 'binned' nodes.

![alt text](https://github.com/dianaow/fifa-viz/raw/master/fifa19_1_new.gif "Demo Feature 1")

### Setup instructions

1. `npm install`

Installs all required packages and dependencies

2. `npm start`

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
