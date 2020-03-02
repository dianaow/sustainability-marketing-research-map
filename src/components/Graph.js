import React, { useRef } from "react"
import * as d3 from "d3"
import Chart from "./Chart"
import * as Consts from "./consts"
import { useChartDimensions, onlyUnique, getRandomArbitrary }  from "./utils"

const Network = ({data, scales}) => {

  const ROOT_ID = Consts.ROOT_ID
  const { nodes, links } = data
  const [ref, dms] = useChartDimensions()

  // label nodes and edges so that appropriate style is assigned
  const root_targets = links.filter(d=>d.source.id == ROOT_ID)
  const parentIDs = root_targets.map(d=>d.target.id).filter(onlyUnique)
  const orgIDs = nodes.filter(d=>d.node_type == 'organization').map(d=>d.id).filter(onlyUnique)
  const rootAccessor = d => [ROOT_ID].indexOf(d.id) != -1
  const parentAccessor = d => parentIDs.indexOf(d.id) != -1
  const rootparentAccessor = d => parentIDs.concat([ROOT_ID]).indexOf(d.id) != -1
  const organizationAccessor = d => orgIDs.indexOf(d.id) != -1
  const berectsAccessor = organizationAccessor // choose node types to be rendered as rectangles
  const accessors = {
    root: rootAccessor,
    parent: parentAccessor,
    rootparent: rootparentAccessor,
    organization: organizationAccessor,
    berects: berectsAccessor
  }
  data.ROOT_ID = ROOT_ID
  data.parentIDs = parentIDs

  if(dms.width>0 & dms.height>0){
    updateGraph(data, Consts.formatYear(Consts.currentDate), accessors, scales, {width: dms.width/2, height: dms.height/2-60}) 
  }
  
  return(
    <div className="Network" ref={ref}>
      <Chart dimensions={dms}>
        <g className='links'></g>
        <g className='nodes'></g>
      </Chart>
    </div>
  )
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Graph Network: Create node and link elements ////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function drawNodes(nodes, accessors) {

  let { root, parent, rootparent, organization, berects } = accessors

  let graphNodesGroup = d3.select('.Network').select('.nodes')
  let graphNodesData = graphNodesGroup.selectAll("g").data(nodes, d => d.id)

  let graphNodesEnter = graphNodesData.enter().append("g")

  graphNodesData.exit().select("circle")
    .transition().duration(Consts.transitionDuration)
    .attr("r", 0)
    .remove()

  graphNodesData.exit().select("rect")
    .transition().duration(Consts.transitionDuration)
    .attr("width", 0)
    .attr("height", 0)
    .remove()

  graphNodesEnter
    .attr("transform", function(d) { 
      if(berects(d)){
        return "translate(" + (d.x0 - d.radius) + "," + (d.y0 - d.radius) + ")";
      } else {
        return "translate(" + d.x0 + "," + d.y0 + ")";
      }
    })

  let graphNodeCircles = graphNodesEnter.filter(d=>!berects(d))
    .append("circle")
      .attr('class', 'node node-circle')
      .attr('id', function(d) {return 'node-' + d.id}) 
      .attr('stroke-width', function(d) {return d.strokeWidth})
      .attr('stroke', function(d) {return d.strokeColor})
      .attr('stroke-opacity', function(d) { return d.opacity})
      .attr('fill-opacity', function(d) { return d.opacity})
      .attr('fill', function(d) {return d.color})

  let graphNodeRects = graphNodesEnter.filter(d=>berects(d))
    .append("rect")
      .attr('class', 'node node-rect')
      .attr('id', function(d) {return 'node-' + d.id}) 
      .attr('stroke-width', function(d) {return d.strokeWidth})
      .attr('stroke', function(d) {return d.strokeColor})
      .attr('stroke-opacity', function(d) { return d.opacity})
      .attr('fill-opacity', function(d) { return d.opacity})
      .attr('fill', function(d) {return d.color})

  let parentLabels = graphNodesEnter.filter(d=>parent(d))
    .append("text")
      .attr('class', 'parent-node-label')
      .attr("font-size", `${Consts.nodeTextSize}px`)
      .attr("text-anchor", "middle")
      .attr('fill', Consts.nodeTextFill)
      .attr('opacity', Consts.nodeTextOpacity)
      .attr('x', d => berects(d) ? d.radius : 0)
      .attr('y', d => (d.radius < Consts.nodeRadius) ? (berects(d) ? -6 : -d.radius-4) : 0 )
      .text(d => `${d.id}`)

  let childrenLabels = graphNodesEnter.filter(d=>!rootparent(d))
    .append("text")
      .attr('class', 'children-node-label')
      .attr("font-size", `${Consts.nodeTextSize/2}px`)
      .attr("text-anchor", "middle")
      .attr('fill', Consts.nodeTextFill)
      .attr('opacity', Consts.childnodeTextOpacity)
      .attr('x', d => berects(d) ? d.radius : 0)
      .attr('y', d => (d.radius < Consts.nodeRadius) ? (berects(d) ? -6 : -d.radius-4) : 0 )
      .text(d => `${d.id}`)

  let rootLabel = graphNodesEnter.filter(d=>root(d)).attr('class', 'root-label')

  rootLabel.append("text")
    .attr("font-size", `${Consts.nodeTextSize*2}px`)
    .attr("text-anchor", "middle")
    .attr('fill', Consts.nodeTextFill)
    .attr('opacity', 1)
    .attr('x', d => berects(d) ? d.radius : 0)
    .attr('y', d => berects(d) ? -10 : -d.radius-10)
    .text('Najib Razak')
    //.text(d => `${d.name}`)

  rootLabel.append("text")
    .attr("class", 'root-label-score')
    .attr("font-size", `${Consts.nodeTextSize*2}px`)
    .attr("text-anchor", "middle")
    .attr('alignment-baseline', 'middle')
    .attr('fill', Consts.nodeFill)
    .attr('opacity', 1)
    .attr('font-size', '24px')
    .attr('x', d => berects(d) ? d.radius : 0)
    .attr('y', d => berects(d) ? d.radius : 0)
    .text(d => Math.round(d.score * 100)/100)

  graphNodesData = graphNodesEnter.merge(graphNodesData)

  graphNodesData.transition().duration(Consts.transitionDuration)
    .attr("transform", function(d) { 
      if(berects(d)){
        return "translate(" + (d.x - d.radius) + "," + (d.y - d.radius) + ")";
      } else {
        return "translate(" + d.x + "," + d.y + ")";
      }
    })

  graphNodesData.selectAll('.parent-node-label')
    .call(function(node) { node.transition()
      .attr('x', d => berects(d) ? d.radius : 0)
      .attr('y', d => (d.radius < Consts.nodeRadius) ? (berects(d) ? -6 : -d.radius-4) : 0 )
    })

  graphNodesData.selectAll('.node-circle')
    .call(function(node) { node.transition()
      .attr('r', function(d) {return d.radius}) 
    })

  graphNodesData.selectAll('.node-rect')
    .call(function(node) { 
        node.transition()
          .attr('width', function(d) {return d.radius*2}) 
          .attr('height', function(d) {return d.radius*2}) 
    })

} //drawNodes: update nodes of graph

function drawLinks(links) {

  let graphLinksGroup = d3.select('.Network').select('.links')
  let graphLinksData = graphLinksGroup.selectAll("g").data(links, d => d.source.id.toString() + "-" + d.target.id.toString())

  let graphLinksEnter = graphLinksData.enter().append("g")

  let graphLinksExit = graphLinksData.exit().select("path")
    .transition().duration(Consts.transitionDuration)
    .attr("stroke-opacity", 0)
    .remove()

  let graphLinksPath = graphLinksEnter.append('path')
    .attr('class', 'link')
    .attr('id', function(d) { return 'path-' + d.source.id.toString() + "-" + d.target.id.toString()})
    .attr('marker-mid', 'url(#arrowhead)')
    .attr('stroke-width', function(d) {return d.strokeWidth})
    .attr('stroke', function(d) {return d.strokeColor})
    .attr("stroke-opacity", d => d.opacity)
    .attr("d", function(d) {
      // Coordinates of mid point on line to add new vertex.
      let midX = (d.target.x0 - d.source.x0) / 2 + d.source.x0;   
      let midY = (d.target.y0 - d.source.y0) / 2 + d.source.y0;
      return "M" + 
          d.source.x0 + "," + d.source.y0 + "L" + 
          midX + ',' + midY + 'L' +
          d.target.x0 + "," + d.target.y0
    })

  let pathLabels = graphLinksEnter
    .append("text")
        .attr('dy', '-2')
      .append('textPath')
        .attr('class', 'edge-label')
        .attr("font-size", d => d.type=='children' ? `${Consts.linkTextSize/2}px` : `${Consts.linkTextSize}px`)
        .attr("text-anchor", "middle")
        .attr("startOffset", d => d.type=='children' ? "40%" : "50%")
        .attr('fill', Consts.linkTextFill)
        .attr('opacity', Consts.linkTextOpacity)
        .attr('xlink:href', d => '#path-' + d.source.id.toString() + "-" + d.target.id.toString())
        .text(d => `${d.link}`)

  graphLinksData = graphLinksEnter.merge(graphLinksData)

  graphLinksData.selectAll('.link').transition().duration(Consts.transitionDuration)
    .attr("stroke-opacity", d => d.opacity)
    .attr("d", function(d) {
    // Coordinates of mid point on line to add new vertex.
    let midX = (d.target.x - d.source.x) / 2 + d.source.x;   
    let midY = (d.target.y - d.source.y) / 2 + d.source.y;
    return "M" + 
        d.source.x + "," + d.source.y + "L" + 
        midX + ',' + midY + 'L' +
        d.target.x + "," + d.target.y
  })

}//drawLinks: update edges of graph

///////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Graph Network: Update node and link styles ////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateScales(data, accessors, scales){

  const { nodes, links, ROOT_ID, parentIDs } = data
  const { colorScale, nodeRadiusScale} = scales
  const { root, parent, rootparent, organization, berects } = accessors

  var linksTarget_nested = d3.nest()
    .key(function(d) { return d.target.id })
    .rollup(function(leaves) { return leaves.length; })
    .entries(links)

  var linksSource_nested = d3.nest()
    .key(function(d) { return d.source.id })
    .rollup(function(leaves) { return leaves.length; })
    .entries(links)

  var linksNested = []
  linksTarget_nested.map(function(d,i) {
    linksNested.push({key: d.key, value: d.value})
  })
  linksSource_nested.map(function(d,i) {
    linksNested.push({key: d.key, value: d.value})
  })

  var linkAllNodes = d3.nest()
    .key(function(d) { return d.key })
    .rollup(function(leaves) { return d3.sum(leaves, d=>d.value) })
    .entries(linksNested)

  // create custom link strength scale based on total number of connections to node (node could be either a source or target)
  var strengthScale = d3.scaleLinear()
    .domain(d3.extent(linkAllNodes, d=>d.value))
    .range([1, 0.1])

  // create custom link distance scale based on overall score (nodes with higher score are placed closer to the parent node)
  var distanceScale = d3.scaleLinear()
    .domain([1,0])
    .range([80, 100])

  nodes.forEach((d,i) => {
    d.score = d.id==ROOT_ID ? 0.8 : d.score
    d.strokeWidth = Consts.nodeStrokeWidth
    d.opacity = Consts.nodeOpacity
  })

  links.forEach((d,i) => {
    d.strokeColor = Consts.linkStroke
    d.strokeWidth = Consts.linkStrokeWidth
    d.opacity = Consts.linkOpacity
  })

  nodes.forEach((d,i) => {
    let conn = linkAllNodes.find(l=>l.key==d.id)
    d.radius = root(d) ? Consts.rootRadius : conn ? nodeRadiusScale(conn.value) : 1
    d.color = parent(d) ? Consts.nodeFill : colorScale(d.countries)
    d.strokeColor = root(d) ? Consts.nodeStroke : colorScale(d.countries)
  })

  links.forEach((d,i) => {
    let conn = linkAllNodes.find(l=>l.key==d.target.id).value
    d.strength = strengthScale(conn)
    d.distance = d.type=='root' ? 150 : 50
  })

  return { 'nodes': nodes, 'links': links }
} //updateScales: update attribute values assigned to nodes and edges

///////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Graph Network: Update graph layout ////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateGraph(data, selectedTime, accessors, scales, dimensions) {

  let { nodes, links, ROOT_ID, parentIDs } = data

  function findType(d, rootID, parentIDs){
    if(parentIDs.indexOf(d) != -1) {
      return 'parent'
    } else if(d==rootID){
      return 'root'
    } else {
      return 'children'
    }
  }

  function parentNodesPos(d) {
    if(d.type=='root'){
      return {x: dimensions.width, y: dimensions.height}
    } else{
      return {x: undefined, y: undefined}
    } 
  }

  function childNodesPos(d) {
    if(d.type=='root'){
      return {x: dimensions.width, y: dimensions.height}
    } else {
      let parent = links.find(el=>el.end_id == d.id)
      return { x: parent ? parent.source.x : undefined, y: parent ? parent.source.y : undefined}
      //return {x: undefined, y: undefined}
    }
  }

  // random modification of graph elements to demonstrate dynamically updating a force layout
  if(selectedTime==2019){
    d3.range(0, 10).map(d=>{
      let ID = parseInt(selectedTime + d)
      nodes.push({id: ID, type: 'children', score: Math.random(), countries: Consts.region[getRandomArbitrary(0,5)]})
      links.push({"start_id": 82007088, "end_id": ID, type: 'children', link: "treasurer of"}) 
    })
  }

  if(selectedTime==2018){
    let removeID = nodes.filter(d=>d.type=='parent').map(d=>d.id)[0] //remove the first parent node
    let removeIDs = links.filter(d=>(d.target.id == removeID)).map(d=>d.start_id) // remove nodes connected to the parent node
    removeIDs = removeIDs.filter(d=>d != ROOT_ID)
    links = links.filter(d=>d.end_id != removeID)
    links = links.filter(d=>removeIDs.indexOf(d.start_id) == -1)
    removeIDs.push(removeID)
    nodes = nodes.filter(d=>removeIDs.indexOf(d.id) == -1)
  }

  if(selectedTime==2017){
    let removeID = 82007143
    let removeIDs = [80106531, 80087688, 80049075]
    links = links.filter(d=>d.end_id != removeID)
    links = links.filter(d=>removeIDs.indexOf(d.start_id) == -1)
    removeIDs.push(removeID)
    nodes = nodes.filter(d=>removeIDs.indexOf(d.id) == -1)

    let singleParents = [82003161, 82009275, 82007879, 82000878, 82007690, 82009333, 82007641, 81061844]
    links = links.filter(d=>singleParents.indexOf(d.end_id) == -1)
    nodes = nodes.filter(d=>singleParents.indexOf(d.id) == -1)
  }

  nodes.forEach((d,i) => {
    let edge = links.find(el=>el.source.id == d.id)
    d.parent_id = edge ? edge.target.id : d.id
    d.type = findType(d.id, ROOT_ID, parentIDs)
  })

  links.forEach((d,i) => {
    d.type = findType(d.source.id, ROOT_ID, parentIDs)
    Consts.linkedByIndex[`${d.source.id},${d.target.id}`] = 1;
  })

  links.forEach((d,i)=>{
    d.source = nodes.find(el=>el.id == d.start_id)
    d.target = nodes.find(el=>el.id == d.end_id)
  })

  nodes.forEach((d,i) => {
    let fixed_coords = parentNodesPos(d)
    let coords = childNodesPos(d)
    d.x  = d.x ? d.x : (coords.x ? coords.x : dimensions.width + Math.random())
    d.y  = d.y ? d.y : (coords.y ? coords.y : dimensions.height + Math.random())
    d.fx = fixed_coords.x
    d.fy = fixed_coords.y
    d.x0 = d.x
    d.y0 = d.y
  })

  let newEle = updateScales(data, accessors, scales)
  nodes = newEle.nodes
  links = newEle.links

  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
      .distance(function(d) { return d.distance })
      .strength(function(d) { return d.strength })
    )
    .force("charge", d3.forceManyBody().strength(-40))
    .force("collide", d3.forceCollide(function(d){ return d.radius * 2 }))
    .force('center', d3.forceCenter(dimensions.width, dimensions.height))
    .alphaTarget(0.8)

  simulation.nodes(nodes);
  simulation.force("link").links(links);
  for (var i = 0, n = 300; i < n; ++i) {
    simulation.tick();
  }

  drawNodes(nodes, accessors)
  drawLinks(links, accessors)

} //updateSlider: things to do once marker on slider is moved


export default Network