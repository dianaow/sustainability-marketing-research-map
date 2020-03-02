import React, { useState, useEffect } from "react"
import Legend from "./components/NetworkLegend"
import Card from "./components/Card"
import Network from "./components/Graph"
import * as Consts from "./components/consts"
import * as d3 from "d3"

import graph from './data/test_graph.json';
import timeline from './data/test_timeline.json';

import "./styles_network.css"

const organizations = ['BOC Aviation Pte. Ltd', 'Neptune Orient Lines Limited', 'BlackRock (Singapore) Holdco Pte. Limited', 'MGPA (Bermuda) Limited', 'Ernst & Young - Singapore']
const ROOT_ID = Consts.ROOT_ID

const entityData = {
  entity: ROOT_ID,
  name: 'Najib Razak',
  full_name: 'Mohd Najb Abdul Razak',
  dob: '23 July 1953',
  nationality: 'Malaysian',
  image: '../data/najib_razak.jpg',
  key_lists: [{'title': 'PEP Tier 1', 'type': 'watch', 'start_time': '01/01/00', 'end_time': 'NA'}],
  key_positions: [
    {'title': 'Prime Minister', 'country': 'Malaysia', 'start_time': '03/04/09', 'end_time': '10/05/18'},
    {'title': 'President of the United Malays National Organisation', 'country': 'Malaysia', 'start_time': '26/03/09', 'end_time': '12/05/18'},
    {'title': 'Deputy Prime Minister', 'country': 'Malaysia', 'start_time': '07/01/04', 'end_time': '01/04/09'}
  ]
}

const timeData = timeline.map((d,i) => {
  let rand = 0.75 + (Math.random()/10)*3
  return {
    date: d.key,
    node_id: ROOT_ID,
    key: Consts.parseDate(d.key), //convert string date to datetime format
    value: rand > 1 ? 1 : rand, // TEMPORARILY ASSIGN RANDOM SCORE
    type: d.key === Consts.currentDateString ? 'present' : (Consts.parseDate(d.key)> Consts.currentDate ? 'predicted' : 'past')
  }
})

// node radius size is scaled based on total number of connections to node (only applied to root or parent nodes)
const nodeRadiusScale = d3.scaleSqrt()
  .domain([1, 50])
  .range([3, Consts.nodeRadius])

const colorScale = d3.scaleOrdinal()
  .domain(Consts.region)
  .range(['aqua', 'fuchsia', 'gold', 'white', 'white'])

const colorScale1 = d3.scaleLinear()
  .domain([0, 0.5, 1])
  .range(['#71C3B4', "white", '#E00217'])

const NetworkPage = () => {

  const getData = (graph, timeline) => {
    return{
      nodes: graph.nodes, 
      links: graph.links,
      timeData: timeline
    }
  }

  const scales = {
    colorScale: colorScale,
    colorScale1: colorScale1,
    nodeRadiusScale: nodeRadiusScale
  }
  
  const [data, setData] = useState(getData(graph, timeline))

  return(
    <div className='App__wrapper'>

      <div className="Entity__Left">
          <Card data={entityData} />
      </div>

      <div className="Entity__Right">

        <Network data={data} scales={scales} />

        <Legend size={nodeRadiusScale} />

        <div className='Chart_info_section'>
          <div className='time'>
            <h2></h2>
          </div>
          <div className='chart-statistics'>
            <div className='chart-statistics-total'>
              <div className='nodes_stats'>
                <div className='nodes_stats_total'>0</div>
                <p>NODES</p>
              </div>
              <div className='edges_stats'>
                <div className='edges_stats_total'>0</div>
                <p>RELATIONSHIPS</p>
              </div>
            </div>
            <div className='chart-statistics-breakdown'></div>
          </div>
        </div>

        <div className='Chart_color_section'>
          <p>Color nodes by:</p>
          <input name="color_scale" 
                 type="button" 
                 className='btn color_category_1'
                 value="Country"/>
          <input name="color_scale" 
                 type="button" 
                 className="btn color_category_2"
                 value="Score"/>
          <p>Only show:</p>
          <input name="entity_filter" 
                 type="button" 
                 className='btn entity_category'
                 value="Person"/>
          <input name="entity_filter" 
                 type="button" 
                 className="btn entity_category"
                 value="Organization"/>
        </div>

        <div className='Chart_controls_section'>
          <div className='button' id="zoom_in">+</div>
          <div className='button' id="zoom_out">-</div>
        </div>

      </div>

    </div>

  )
}

export default NetworkPage
