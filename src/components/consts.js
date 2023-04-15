import * as d3 from 'd3'

export const unitType = ['Title', 'Abstract', 'Introduction', 'Discussion', 'Conclusion', 'Overall']
export const topicCategories = ['Businesses', 'Consumers', 'Institutions']
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

export const invisibleArc = (axis, radius, angleSlice) => {

  var arc = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius+5)
      .startAngle(angleSlice*(axis))
      .endAngle(angleSlice*(axis+1))

  //Search pattern for everything between the start and the first capital L
  var firstArcSection = /(^.+?)L/;  

  //Grab everything up to the first Line statement
  var newArc = firstArcSection.exec( arc() )[1];

  //Replace all the comma's so that IE can handle it
  newArc = newArc.replace(/,/g , " ");
    
  //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
  //flip the end and start position
  if (axis >= 5 && axis <= 9) {
    var startLoc  = /M(.*?)A/,    //Everything between the first capital M and first capital A
      middleLoc   = /A(.*?)0 0 1/,  //Everything between the first capital A and 0 0 1
      endLoc    = /0 0 1 (.*?)$/; //Everything between the first 0 0 1 and the end of the string (denoted by $)
    //Flip the direction of the arc by switching the start en end point (and sweep flag)
    //of those elements that are below the horizontal line
    var newStart = endLoc.exec( newArc )[1];
    var newEnd = startLoc.exec( newArc )[1];
    var middleSec = middleLoc.exec( newArc )[1];
    
    //Build up the new arc notation, set the sweep-flag to 0
    newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;

  }//if

  return newArc
}