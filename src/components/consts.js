import * as d3 from 'd3'

export const unitType = ['Title', 'Abstract', 'Introduction', 'Discussion', 'Conclusion', 'Overall']
export const topicCategories = ['Business', 'Consumer', 'Institution']
//export const tagCategories = ['Self', 'Oth', 'SP', 'Soc', 'Env', 'Prof', 'Gro']
export const tagCategories = ['Self-Profit-Growth', 'Society', 'Environment', 'Sustainability', 'Other'].reverse()
export const scoreCategories = d3.range(0, 6)
export const angleSlice = (Math.PI * 2) / topicCategories.length
export const bufferInRad = 0.12 * angleSlice

export const colorScale = d3.scaleOrdinal()
  .range(['aqua', 'fuchsia', 'gold', 'lime', 'white', 'white'])
  .domain(unitType)

export const fillScale = d3.scaleOrdinal()
  .range(['aqua', 'fuchsia', 'gold', 'lime', 'white', 'transparent'])
  .domain(unitType)

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

export const nodeRadiusScale = d3.scaleSqrt()
.domain([1, 100])
.range(window.innerHeight < 800 ? [1.5, 16.5] : [2, 22])