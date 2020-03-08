import React, { useRef, useEffect, useContext, useState } from "react"
import * as d3 from "d3"
import Chart from "./Chart"
import * as Consts from "./consts"
import { useChartDimensions, onlyUnique, getRandomArbitrary, round }  from "./utils"
import Timeline from "./Timeline"
import Legend from "./NetworkLegend"
import { MyContext } from "../NetworkPage"
import Tooltip from "./NetworkTooltip";

let selected = false
let nodeTextOpacity = Consts.nodeTextOpacity
let linkTextOpacity = Consts.linkTextOpacity
const ROOT_ID = Consts.ROOT_ID

// node radius size is scaled based on total number of connections to node (only applied to root or parent nodes)
const nodeRadiusScale = d3.scaleSqrt()
  .domain([1, 50])
  .range([3, Consts.nodeRadius])

const regionScale = d3.scaleOrdinal()
  .domain(Consts.region)
  .range(['aqua', 'fuchsia', 'gold', 'white', 'white'])

const scoreScale = d3.scaleLinear()
  .domain([0, 0.5, 1])
  .range(['#71C3B4', "white", '#E00217'])

const scales = {
  colorAccessor: d => regionScale(d.countries), // default is to color code nodes by region
  colorScale: regionScale, 
  colorScale1: scoreScale,
  nodeRadiusScale: nodeRadiusScale
}

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink()
    .distance(function(d) { return d.distance })
    .strength(function(d) { return d.strength })
  )
  .force("charge", d3.forceManyBody().strength(-90))
  .force("collide", d3.forceCollide(function(d){ return d.radius * 2 }))
  .alphaTarget(0.8)

const Network = () => {

  const { current, dispatch } = useContext(MyContext)
  const [ref, dms] = useChartDimensions()

  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: {}, position: 'right' })
  const [zoomState, setZoomState] = useState({ x:0,y:0,k:1 })
  const [panelState, setPanelState] = useState({ 'country': true, 'score': false, 'person': true, 'organization': true, 'clicked': null})

  const zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", ()=>setZoomState(d3.event.transform))
  const Z = {zoom: zoom, setTooltip: setTooltip, dimensions: {width: dms.width/2, height: dms.height/2-60}}

  ///////////////////////// Initial Graph Render //////////////////////////
  useEffect(() => {
    if(current.date === Consts.currentDate){
      if(dms.width>0 & dms.height>0){
        let graph = updateGraph(current, scales, Z) 
      }
    }

  }, [dms.width, dms.height])

  //////////////////////////////// Update Graph ///////////////////////////
  useEffect(() => {

    simulation.stop()

    // temporarily only allow the network to be updated for the following dates
    const tempDates = ['Jan 2015', 'Jan 2016', 'Jan 2017', 'Jan 2018', 'Jan 2019']
    const formattedDate = Consts.formatDate(current.date)
    const toUpdate = tempDates.indexOf(formattedDate) != -1
    if(toUpdate==true ){
      let graph = updateGraph(current, scales, Z) 
      dispatch({ type: 'SET_STATS', nodes: graph.nodes, links: graph.links })
    }
  }, [current.date])

  //////////////// Create a zoom and set initial zoom level /////////////
  const svg = d3.selectAll('.networkWrapper')
  svg.call(zoom).on("dblclick.zoom", null);

  useEffect(() => {

    if(selected === false){

      if(zoomState.k >= 1.4){
        nodeTextOpacity = 1
        linkTextOpacity = 0.5
      } else if(zoomState.k < 1.4){
        nodeTextOpacity = Consts.nodeTextOpacity
        linkTextOpacity = Consts.linkTextOpacity
      }
      d3.selectAll('.edge-label').attr('opacity', linkTextOpacity)
      d3.selectAll('.parent-node-label').attr('opacity', nodeTextOpacity)
      d3.selectAll('.children-node-label').attr('opacity', nodeTextOpacity)

    } else if (selected === true){

      if(zoomState.k >= 1.4){
        nodeTextOpacity = 0
        linkTextOpacity = 0.5
      }
    }

  }, [zoomState])

  //////////////// Control panel logic and set initial setting /////////////
  useEffect(() => {

    let val = panelState.clicked
    
    let graphNodesGroup = d3.select('.Network').select('.nodes')
    let graphLinksGroup = d3.select('.Network').select('.links')

    // find all nodes in selected category except for the root node which can never be changed
    let nodesToRemove = current.nodes.filter(d=>d.node_type==val & d.type!='root')

    let linksToRemove = []
    nodesToRemove.map(d=>{
      // find links connected to any node to be changed
      linksToRemove.push(...current.links.filter(o => o.source.id === d.id || o.target.id === d.id))
      graphNodesGroup.select('#node-' + d.id)
        .attr('fill-opacity', panelState[val] ? Consts.nodeOpacity : 0.2) // change opacity
        .attr('stroke-opacity', panelState[val] ? Consts.nodeOpacity : 0.2)
    })

    linksToRemove.map(d=>{
      graphNodesGroup.select('#path-' + d.source.id.toString() + "-" + d.target.id.toString())
        .attr('stroke-opacity', panelState[val] ? Consts.linkOpacity : 0.1) // change opacity
    })

  }, [panelState.person, panelState.organization])

  const checkActiveBtn = (name) => {
    let activeFilter = Object.keys(panelState).filter(id=>panelState[id])
    return (activeFilter.indexOf(name) != -1) ? "btn active" : "btn";
  }

  const showControlPanel = () => {
    return(
      <React.Fragment>
        <div className='Chart_color_section'>
          <p>Color nodes by:</p>
          <input name="color_scale" 
                 type="button" 
                 className={checkActiveBtn('country')}
                 onClick={() => {
                  setPanelState({'country': true, 'score': false, 'person': panelState.person, 'organization': panelState.organization, 'clicked': 'country'})
                  scales.colorAccessor = d => regionScale(d.countries)
                  let newEle = updateAttributes(current.nodes, current.links, scales)
                  draw(newEle.nodes, newEle.links, newEle.accessors, Z)
                 }}
                 value="Country"/>
          <input name="color_scale" 
                 type="button"
                 className={checkActiveBtn('score')} 
                 onClick={() => {
                  setPanelState({'country': false, 'score': true, 'person': panelState.person, 'organization': panelState.organization, 'clicked': 'score'})
                  scales.colorAccessor = d => scoreScale(d.score)
                  let newEle = updateAttributes(current.nodes, current.links, scales)
                  draw(newEle.nodes, newEle.links, newEle.accessors, Z)
                 }}
                 value="Score"/>
          <p>Only show:</p>
          <input name="entity_filter" 
                 type="button" 
                 className={checkActiveBtn('person')}
                 onClick={() => setPanelState({ 'country': panelState.country, 'score': panelState.score, 'person': !panelState.person, 'organization': panelState.organization, 'clicked': 'person'})}
                 value="Person"/>
          <input name="entity_filter" 
                 type="button" 
                 className={checkActiveBtn('organization')}
                 onClick={() => setPanelState({ 'country': panelState.country, 'score': panelState.score, 'person': panelState.person, 'organization': !panelState.organization, 'clicked': 'organization'})}
                 value="Organization"/>
        </div>

        <div className='Chart_controls_section'>
          <div className="button zoom_in" onClick={ ()=> {
            setZoomState({ x:zoomState.x, y:zoomState.y, k:zoomState.k*1.2 })
            zoom.scaleBy(svg.transition().duration(750), 1.2);
           } }>+</div>
          <div className="button zoom_out" onClick={ ()=> {
            setZoomState({ x:zoomState.x, y:zoomState.y, k:zoomState.k*0.8 })
            zoom.scaleBy(svg.transition().duration(750), 0.8);
          } }>-</div>
        </div>
      </React.Fragment>
    )
  }

  return(
    <div className="Network" ref={ref}>
      <Chart dimensions={dms}>
        <defs>
          <marker id="arrowheadTransparent" viewBox="-0 -5 10 10" refX="0" refY="0" orient="auto" markerWidth="7" markerHeight="10">
            <path d="M 0,-5 L 10 ,0 L 0,5" fill="white" fillOpacity="0" stroke="none"></path>
          </marker>
        </defs>
        <defs>
          <marker id="arrowhead" viewBox="-0 -5 10 10" refX="0" refY="0" orient="auto" markerWidth="7" markerHeight="10">
            <path d="M 0,-5 L 10 ,0 L 0,5" fill="white" fillOpacity="0.3" stroke="none"></path>
          </marker>
        </defs>
        <defs>
          <marker id="arrowheadOpaque" viewBox="-0 -5 10 10" refX="0" refY="0" orient="auto" markerWidth="7" markerHeight="10">
            <path d="M 0,-5 L 10 ,0 L 0,5" fill="white" fillOpacity="1" stroke="none"></path>
          </marker>
        </defs>      
        <g className='network' transform={`translate(${zoomState.x}, ${zoomState.y}) scale(${zoomState.k})`}>
          <g className='links'></g>
          <g className='nodes'></g>
        </g>
        <Timeline dimensions={dms} />
        <Tooltip width={200} height={300} tooltip={tooltip} />
      </Chart>
      {showControlPanel()}
      <Legend scales={scales} bool={panelState.country} />
    </div>
  )
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Graph Network: Create node and link elements ////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function draw(nodes, links, accessors, z) {

  function nodeKey(n) {
    return n.id;
  }
  function linkKey(d) {
    return d.source.id + '-' + d.target.id;
  }

  let { zoom, setTooltip, dimensions } = z
  let { root, parent, rootparent, organization, berects } = accessors
  let graphNodesGroup = d3.select('.Network').select('.nodes')
  let graphLinksGroup = d3.select('.Network').select('.links')

  // DRAW NODES
  let graphNodesData = graphNodesGroup.selectAll("g").data(nodes, d => nodeKey(d))

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

  graphNodesData.exit().select("text")
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
      .attr("font-size", `${Consts.nodeTextSize/1.5}px`)
      .attr("text-anchor", "middle")
      .attr('fill', Consts.nodeTextFill)
      .attr('opacity', Consts.nodeTextOpacity)
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
    .attr('font-size', '20px')
    .attr('x', d => berects(d) ? d.radius : 0)
    .attr('y', d => berects(d) ? d.radius : 0)
    .text(d => round(d.score))

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
      .attr('fill', d=>d.color)
      .attr('stroke', d=>d.strokeColor)
    })

  graphNodesData.selectAll('.node-rect')
    .call(function(node) { 
        node.transition()
          .attr('width', function(d) {return d.radius*2}) 
          .attr('height', function(d) {return d.radius*2}) 
          .attr('fill', d=>d.color)
          .attr('stroke', d=>d.strokeColor)
    })

  graphNodesData.selectAll('.node')
    .filter(d=>!root(d))
    .on('mouseover.fade', d => hoverOver(d))
    .on('mouseout.fade', d => hoverOut(d))

  graphNodesData.selectAll('.node') // only parent nodes are clickable
    .filter(d=>parent(d))
    .on('click', d => click(d))

  // DRAW LINKS
  let graphLinksData = graphLinksGroup.selectAll("g").data(links, d=>linkKey(d))

  let graphLinksEnter = graphLinksData.enter().append("g")

  let graphLinksExit = graphLinksData.exit().select("path")
    .transition().duration(Consts.transitionDuration)
    .attr("stroke-opacity", 0)
    .remove()

  let graphLinksPath = graphLinksEnter.append('path')
    .attr('class', 'link')
    .attr('id', function(d) { return 'path-' + linkKey(d)})
    .attr('marker-mid', 'url(#arrowhead)')
    .attr('stroke-width', function(d) {return d.strokeWidth})
    .attr('stroke', function(d) {return d.strokeColor})
    .attr("opacity", d => d.opacity)
    .attr("d", d => path({
      source: {x: d.source.x0, y: d.source.y0, r: d.source.radius},
      target: {x: d.target.x0, y: d.target.y0, r: d.target.radius}
    }, d.source.type=='root' ? false : true))

  let pathLabels = graphLinksEnter
    .append("text")
      .attr('class', 'edge-label')
      .attr("font-size", d => d.type=='children' ? `${Consts.linkTextSize/2}px` : `${Consts.linkTextSize}px`)
      .attr("text-anchor", "middle")
      .attr('fill', Consts.linkTextFill)
      .attr('opacity', Consts.linkTextOpacity)
      .attr('dy', -2)
      .attr('pointer-events', 'none')
    .append('textPath')
      .attr('xlink:href', d => '#path-' + linkKey(d))
      .attr("startOffset", "50%")
      .text(d => `${d.link}`)

  graphLinksData = graphLinksEnter.merge(graphLinksData)

  graphLinksData.selectAll('.link').transition().duration(Consts.transitionDuration)
    .attr("opacity", d => d.opacity)
    .attr("d", d => path({
      source: {x: d.source.x, y: d.source.y, r: d.source.radius},
      target: {x: d.target.x, y: d.target.y, r: d.target.radius}
    }, d.source.type=='root' ? false : true))

  // graphLinksData.selectAll('text')
  //   .attr('dy', function(d,i){
  //     if (d.target.x<d.source.x){
  //       return d.type=='children' ? `${Consts.linkTextSize/2}px` : `${Consts.linkTextSize}px`
  //     } else {
  //       return d.type=='children' ? `${-Consts.linkTextSize/4}px` : `${-Consts.linkTextSize/2}px`
  //     }
  //   })
  //   .attr('transform', function(d,i){
  //     if (d.target.x<d.source.x){
  //       let bbox = this.getBBox()
  //       let rx = bbox.x+bbox.width/2;
  //       let ry = bbox.y+bbox.height/2;
  //       return 'rotate(180 '+rx+' '+ry+')' //auto rotate paths
  //       }
  //     else {
  //       return 'rotate(0)'
  //       }
  //   })

  // INTERACTIVITY
  function hoverOver(d) {
    let translation = getTranslation(d3.selectAll('.networkWrapper').selectAll('.root-label').attr('transform'))
    let X = translation[0]
    if(selected === false){
      let hoverAttr = {hover_textOpacity: 0, hover_strokeOpacity: 0.2, hover_arrow: 'url(#arrowhead)'}
      highlightConnections(d, hoverAttr)
      setTooltip({
        show: true,
        x: d.x,
        y: d.y,
        content: d,
        position: (d.x>X) ? 'right' : 'left',
      })
    }
  }

function getTranslation(transform) {
  // Create a dummy g for calculation purposes only. This will never
  // be appended to the DOM and will be discarded once this function 
  // returns.
  var g = document.createElementNS('http://www.w3.org/2000/svg', "g");
  
  // Set the transform attribute to the provided string value.
  g.setAttributeNS(null, "transform", transform);
  
  // consolidate the SVGTransformList containing all transformations
  // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
  // its SVGMatrix. 
  var matrix = g.transform.baseVal.consolidate().matrix;
  
  // As per definition values e and f are the ones for the translation.
  return [matrix.e, matrix.f];
}

  function hoverOut(d) {
    if(selected === false){
      unhighlightConnections(d)
      // setTooltip({ 
      //   show: false, 
      //   content: {} 
      // })
    }
  }

  function click(d) {
   
    var svg =  d3.selectAll('.networkWrapper')
    var rootNode = svg.selectAll('.root-label')
    var rootEdge = svg.selectAll('#path-' + ROOT_ID + '-' + d.id)

    if(selected==false){

      let hoverAttr = {hover_textOpacity: 0, hover_strokeOpacity: 0, hover_arrow: 'url(#arrowheadTransparent)'}
      highlightConnections(d, hoverAttr)

      var thisX = dimensions.width - d.x*1.8
      var thisY = dimensions.height - d.y*1.8

      // rootEdge
      //   .transition().duration(350)
      //   .attr("d", el => path({
      //     source: {x: d.x, y: d.y, r: el.source.radius/2},
      //     target: {x: el.target.x, y: el.target.y, r: el.target.radius}
      //   }))

      rootNode
        .transition().duration(350)
        .attr('transform', el=>`translate(${el.x}, ${el.y})scale(0.5)`)

      svg.transition().duration(350).delay(500).call(
        zoom.transform,
        d3.zoomIdentity.translate(thisX, thisY).scale(1.8)
      );

      graphLinksData.selectAll('.edge-label').attr('opacity', o => (o.source === d || o.target === d ? 0.5 : Consts.linkTextOpacity))

      selected=true

    } else {

      setTimeout(function(){
        unhighlightConnections(d)
        graphLinksData.selectAll('.edge-label').attr('opacity', Consts.linkTextOpacity)
        selected=false
      }, 750)
      
      // rootEdge
      //   .transition().duration(350)
      //   .attr("d", el => path({
      //     source: {x: el.source.x, y: el.source.y, r: el.source.radius},
      //     target: {x: el.target.x, y: el.target.y, r: el.target.radius}
      //   }))

      rootNode
        .transition().duration(350)
        .attr('transform', el=>`translate(${el.x}, ${el.y})scale(1)`)

      svg.transition().duration(350).delay(150).call(
        zoom.transform,
        d3.zoomIdentity
      )

    }

    // graphNodesData.selectAll('.node').filter(o => isConnected(d, o))
    //   .call(d3.drag()
    //     .on("start", dragstarted)
    //     .on("drag", dragged)
    //     .on("end", dragended))

  }


  function highlightConnections(d, hoverAttr) {

    const { hover_textOpacity, hover_strokeOpacity, hover_arrow } = hoverAttr
    graphNodesData.selectAll('.node')
      .attr('stroke-opacity', function (o) {
        const thisOpacity =  isConnected(d, o) ? 1 : hover_strokeOpacity
        this.setAttribute('fill-opacity', thisOpacity)
        return thisOpacity
      })
      .attr('pointer-events', 'none')

    graphNodesData.selectAll('.root-label text').attr('opacity', o => (isConnected(d, o) ? 1 : 0.4))
    graphNodesData.selectAll('.parent-node-label').attr('opacity', o => (isConnected(d, o) ? 1 : hover_textOpacity))
    graphNodesData.selectAll('.children-node-label').attr('opacity', o => (isConnected(d, o) ? 1 : hover_textOpacity))

    graphLinksData.selectAll('.link')
      .attr('opacity', o => (o.source === d || o.target === d ? 1 : hover_strokeOpacity))
      .attr('marker-mid', o => (o.source === d || o.target === d) ? 'url(#arrowheadOpaque)' : hover_arrow)
    graphLinksData.selectAll('.edge-label').attr('opacity', o => (o.source === d || o.target === d ? linkTextOpacity : hover_textOpacity))
  }

  function unhighlightConnections(d) {

    graphNodesData.selectAll('.node')
      .attr('stroke-opacity', Consts.nodeOpacity)
      .attr('fill-opacity', Consts.nodeOpacity)
      .attr('pointer-events', 'all')

    graphNodesData.selectAll('.root-label text').attr('opacity', 1)
    graphNodesData.selectAll('.parent-node-label').attr('opacity', Consts.nodeTextOpacity)
    graphNodesData.selectAll('.children-node-label').attr('opacity', nodeTextOpacity)

    graphLinksData.selectAll('.link').attr('opacity', Consts.linkOpacity)
    graphLinksData.selectAll('.edge-label').attr('opacity', linkTextOpacity)

  }

  function dragstarted(d) {
    console.log(d3.event.x, d3.event.y)
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

}//draw: update nodes and edges of graph

function path(d, exclude_radius=false) {

  if(exclude_radius){

    var dx = d.target.x - d.source.x;
    var dy = d.target.y - d.source.y;
    var gamma = Math.atan2(dy,dx); // Math.atan2 returns the angle in the correct quadrant as opposed to Math.atan
    var sourceNewX = d.source.x + (Math.cos(gamma) * d.source.r);
    var sourceNewY = d.source.y + (Math.sin(gamma) * d.source.r);
    var targetNewX = d.target.x - (Math.cos(gamma) * d.target.r);
    var targetNewY = d.target.y - (Math.sin(gamma) * d.target.r);

  } else {

    var sourceNewX = d.source.x;
    var sourceNewY = d.source.y;
    var targetNewX = d.target.x;
    var targetNewY = d.target.y;

  }

  // Coordinates of mid point on line to add new vertex.
  let midX = (targetNewX - sourceNewX) / 2 + sourceNewX   
  let midY = (targetNewY - sourceNewY) / 2 + sourceNewY
  return "M" + 
      sourceNewX + "," + sourceNewY + "L" + 
      midX + ',' + midY + 'L' +
      targetNewX + "," + targetNewY
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Graph Network: Update node and link styles ////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateAttributes(nodes, links, scales){

  const { colorAccessor, nodeRadiusScale } = scales
  const root_targets = links.filter(d=>d.start_id == ROOT_ID)
  const parentIDs = root_targets.map(d=>d.end_id).filter(onlyUnique)
  const orgIDs = nodes.filter(d=>d.node_type == 'organization').map(d=>d.id).filter(onlyUnique)

  // set up accessors
  const root = d => [ROOT_ID].indexOf(d.id) != -1
  const parent = d => parentIDs.indexOf(d.id) != -1
  const rootparent = d => parentIDs.concat([ROOT_ID]).indexOf(d.id) != -1
  const organization = d => orgIDs.indexOf(d.id) != -1
  const berects = organization // choose node types to be rendered as rectangles
  const accessors = {
    root: root,
    parent: parent,
    rootparent: rootparent,
    organization: organization,
    berects: berects
  }

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
    d.score = d.score
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
    d.color = parent(d) ? Consts.nodeFill : colorAccessor(d)
    d.strokeColor = root(d) ? Consts.nodeStroke : colorAccessor(d)
  })

  links.forEach((d,i) => {
    let conn = linkAllNodes.find(l=>l.key==d.target.id).value
    d.strength = strengthScale(conn)
    d.distance = d.type=='root' ? 150 : 50
  })

  return { 'nodes': nodes, 'links': links, 'accessors': accessors }
} //updateAttributes: update attribute values assigned to nodes and edges

///////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Graph Network: Update graph layout ////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateGraph(data, scales, z) {

  let { nodes, links, date } = data 
  const selectedTime = Consts.formatYear(date)
  const { dimensions } = z

  const root_targets = links.filter(d=>d.start_id == ROOT_ID)
  const parentIDs = root_targets.map(d=>d.end_id).filter(onlyUnique)

  function findType(d){
    if(parentIDs.indexOf(d) != -1) {
      return 'parent'
    } else if(d==ROOT_ID){
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
    }
  }

  // random modification of graph elements to demonstrate dynamically updating a force layout
  if(selectedTime==2019){
    d3.range(0, 10).map(d=>{
      let ID = parseInt(selectedTime + d)
      nodes.push({id: ID, type: 'children', node_type: 'person', score: Math.random(), countries: Consts.region[getRandomArbitrary(0,5)]})
      links.push({"start_id": 82007088, "end_id": ID, type: 'children', link: "treasurer of"}) 
    })
  }

  if(selectedTime==2018){
    let removeID = nodes.filter(d=>d.type=='parent').map(d=>d.id)[0] //remove the first parent node
    let removeIDs = links.filter(d=>(d.end_id == removeID)).map(d=>d.start_id) // remove nodes connected to the parent node
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

  links.forEach((d,i)=>{
    d.source = nodes.find(el=>el.id == d.start_id)
    d.target = nodes.find(el=>el.id == d.end_id)
  })

  nodes.forEach((d,i) => {
    let edge = links.find(el=>el.source.id == d.id)
    d.parent_id = edge ? edge.target.id : d.id
    d.type = findType(d.id)
  })

  links.forEach((d,i) => {
    d.type = findType(d.source.id)
    Consts.linkedByIndex[`${d.source.id},${d.target.id}`] = 1;
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

  let newEle = updateAttributes(nodes, links, scales)
  nodes = newEle.nodes
  links = newEle.links

  simulation.force('center', d3.forceCenter(dimensions.width, dimensions.height))
  simulation.nodes(nodes)
  simulation.force("link").links(links)
  simulation.alpha(0.3).restart()
  for (var i = 0, n = 300; i < n; ++i) {
    simulation.tick()
  }

  if(selectedTime==2020){
    nodes.forEach((d,i) => {
      d.x0 = d.x
      d.y0 = d.y    
    })
  }

  draw(nodes, links, newEle.accessors, z)

  return {nodes: nodes, links: links}

} //updateGraph: things to do once marker on slider is moved


function isConnected(a, b) {
  return Consts.linkedByIndex[`${a.id},${b.id}`] || Consts.linkedByIndex[`${b.id},${a.id}`] || a.id === b.id;
}

function comparerLinks(otherArray){
  return function(current){
    return otherArray.filter(function(other){
      return other.source.id == current.source.id && other.target.id == current.target.id
    }).length == 0;
  }
}

function comparerNodes(otherArray){
  return function(current){
    return otherArray.filter(function(other){
      return other.id == current.id
    }).length == 0;
  }
}

export default Network