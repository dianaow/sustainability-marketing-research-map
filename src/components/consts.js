import * as d3 from 'd3'

export const people_relationships = ['employee of', 'co-workers', 'family', 'attorney', 'investment manager']
export const org_relationships = ['board member of', 'director of', 'shareholder of']
export const countries = ['France', 'Spain', 'Portugal', 'Brazil', 'Switzerland']
//export const categories = ['Rules Score','POI Matching Score', 'Anomaly Score', 'PM Score', 'UT Score', 'Social Network Score']
//export const persona = ['Actor', 'PEP', 'Insider', 'GOS', 'Terrorist']
export const categories = ['Total Attacking', 'Total Skill', 'Total Movement', 'Total Power', 'Total Mentality', 'Total Defending']
export const persona = ['Europe & Central Asia', 'Latin America & Caribbean', 'Middle East & North Africa', 'North America', 'Sub-Saharan Africa', 'East Asia & Pacific']

export const SCORE_THRESHOLD = 0.7
export const NODE_SIZE = 3
export const LEVELS = 5
export const LOWER = 0
export const UPPER = 1

export const colorScale = d3.scaleOrdinal()
  .range(['aqua', 'fuchsia', 'gold', 'white', 'white', 'white'])
  .domain(persona)

export const fillScale = d3.scaleOrdinal()
  .range(['aqua', 'fuchsia', 'gold', 'white', 'transparent', 'transparent'])
  .domain(persona)

export const fociRadius = d3.scaleSqrt()
    .range([3, 10])
    .domain([SCORE_THRESHOLD, UPPER])

export const bufferInRad = 10 * (Math.PI / 180)

export const angleSlice = (Math.PI * 2) / categories.length

// set node, link, text color and dimensions
export const rootRadius = 30
export const nodeRadius = 40
export const nodeStrokeWidth = 2
export const nodeStroke = 'white'
export const nodeFill = '#011C54'
export const nodeOpacity = 1
export const nodeTextFill = 'white'
export const nodeTextOpacity = 0.5
export const childnodeTextOpacity = 0
export const nodeTextSize = 6

export const linkStrokeWidth = 0.6
export const linkStroke = 'white'
export const linkOpacity = 0.5
export const linkTextFill = 'white'
export const linkTextOpacity = 0
export const linkTextSize = 5
export const transitionDuration = 1000

export const linkedByIndex = {}

export const formatYear = d3.timeFormat("%Y")
export const formatDate = d3.timeFormat("%b %Y")
export const formatFullDate = d3.timeFormat("%d/%m/%y")
export const parseDate = d3.timeParse("%Y-%m-%d")
export const parseDate1 = d3.timeParse("%Y")
export const parseDate2 = d3.timeParse("%b %Y")
export const currentDateString = '2020-02-01'
export const currentDate = parseDate(currentDateString)

export const ROOT_ID = 80114141
export const NAME = 'John Doe'

// node radius size is scaled based on total number of connections to node (only applied to root or parent nodes)
const nodeRadiusScale = d3.scaleSqrt()
  .domain([1, 50])
  .range([4, nodeRadius])

const scoreScale = d3.scaleLinear()
  .domain([0, 0.5, 1])
  .range(['#71C3B4', "white", '#E00217'])

export const scales = {
  colorAccessor: d => colorScale(d.persona), // default is to color code nodes by persona
  colorScale, 
  scoreScale,
  nodeRadiusScale
}
