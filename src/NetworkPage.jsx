import React, { useState, useEffect, useReducer } from "react"
import Card from "./components/Card"
import Network from "./components/Graph"
import * as Consts from "./components/consts"
import * as d3 from "d3"
import graph from './data/test_graph.json';
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'

import "./styles_network.css"

export const MyContext = React.createContext(null)

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

const showLoader = () => (
  <div className='Loading'>
    <Segment>
      <Dimmer active>
        <Loader size='huge'>Loading</Loader>
      </Dimmer>

      <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
    </Segment>

  </div>
)

const NetworkPage = () => {

  const [data, setData] = useState({ nodes: graph.nodes, links: graph.links })
  const [loading, setLoading] = useState({ loading: true })
  
  const initialState = {
    date: Consts.currentDate, 
    nodes: data.nodes, 
    links: data.links,
  }

  function reducer(state, action) {
    switch (action.type) {
      case 'SET_DATE':
        return {
          date: action.date,
          nodes: state.nodes,
          links: state.links
        }
      case 'SET_STATS':
        return {
          date: state.date,
          nodes: action.nodes,
          links: action.links
        }
      default:
        return initialState
    }
  }

  const [current, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    setTimeout(function(){
      setLoading({ loading: false })
    }, 500)
  }, [data])

  return(
    <div className='App__wrapper'>

      <div className="Entity__Left">
          <Card data={entityData} />
      </div>

      <div className="Entity__Right">

        <div className='Chart_info_section'>
          <div className='time'>
            <h2>{ Consts.formatDate(current.date) }</h2>
          </div>
          <div className='chart-statistics'>
            <div className='chart-statistics-total'>
              <div className='nodes_stats'>
                <div className='nodes_stats_total'><h2>{ current.nodes.length }</h2></div>
                <p>NODES</p>
              </div>
              <div className='edges_stats'>
                <div className='edges_stats_total'><h2>{ current.links.length }</h2></div>
                <p>RELATIONSHIPS</p>
              </div>
            </div>
            <div className='chart-statistics-breakdown'></div>
          </div>
        </div>

        { loading.loading && showLoader() }

        <MyContext.Provider value={{ current, dispatch }}>
          { loading.loading === false && <Network /> }
        </MyContext.Provider>

      </div>

    </div>

  )
}

export default NetworkPage
