import * as d3 from 'd3'

export const unitType = ['Title', 'Abstract', 'Introduction', 'Discussion', 'Conclusion', 'Overall']
export const topicCategories = ['Business', 'Consumer', 'Institution']
//export const tagCategories = ['Self', 'Oth', 'SP', 'Soc', 'Env', 'Prof', 'Gro']
export const tagCategories = ['Self-Profit-Growth', 'Society', 'Environment'].reverse()
export const scoreCategories = d3.range(1, 6)
export const angleSlice = (Math.PI * 2) / topicCategories.length
export const bufferInRad = 0.09 * angleSlice

export const colors = ['#81b29a', '#0081a7', '#ac82b0']

export const colorScale = d3.scaleOrdinal()
  .range(['orange', 'yellow', 'aqua', 'fuchsia', 'lime', 'tomato', 'aqua', 'fuchsia', 'tomato', 'lime'])
  //.domain(tagCategories)

export const fillScale = d3.scaleOrdinal()
  .range(['orange', 'yellow', 'aqua', 'fuchsia', 'lime', 'tomato', 'transparent', 'transparent', 'transparent', 'transparent'])
  //.domain(tagCategories)

  
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
.domain([1, 200])
.range(window.innerHeight < 800 ? [1.5, 16.5] : [2, 22])

export const nodeOpacityScale = d3.scaleLinear()
.domain(scoreCategories)
.range([0.4, 1])