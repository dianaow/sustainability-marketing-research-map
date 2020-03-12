import React, { useState, useEffect, useReducer, createContext } from "react"
import { Dimmer, Loader, Image, Segment, Icon } from 'semantic-ui-react'
import * as d3 from "d3"

import graph from './data/test_graph.json';
import Header from "./components/Shared/Header"
import Card from "./components/Network/Card"
import Network from "./components/Network/NetworkSection"

import reducer from "./components/reducers/NetworkReducer"

import * as Consts from "./components/consts"

import "./styles_network.scss"

export const NetworkContext = createContext()

const events = [
  {'type': 'Has Bank Account', 'description': 'HSBC: 134-435-486', 'date': '03/04/19'},
  {'type': 'Bank Transaction', 'description': 'Has Received: $10000', 'date': '26/03/19'},
  {'type': 'Bank Transaction', 'description': 'Has Sent: $50000', 'date': '26/03/19'},
  {'type': 'Bank Transaction', 'description': 'Has Sent: $50000', 'date': '31/03/19'},
  {'type': 'Has Registered Address', 'description': 'Paris, France', 'date': '07/01/14'}
]

const entityData = {
  entity: Consts.ROOT_ID,
  name: Consts.NAME,
  full_name: 'John Doe Silva',
  dob: '1o January 1953',
  nationality: 'Portugal',
  image: '../data/najib_razak.jpg',
  key_lists: [{'title': 'PEP Tier 1', 'type': 'watch', 'start_time': '01/01/00', 'end_time': 'NA'}],
  key_positions: [
    {'title': 'CEO, North Star Overseas Enterprises Inc', 'country': 'Portugal', 'start_time': '03/04/09', 'end_time': '10/05/18'},
    {'title': 'President, Stichting Fuchs Family Charity', 'country': 'Spain', 'start_time': '26/03/09', 'end_time': '12/05/18'},
    {'title': 'Director, Hunt Oil Company', 'country': 'Spain', 'start_time': '07/01/04', 'end_time': '01/04/09'}
  ],
  events
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

function processData(data) {

  data.forEach((d,i) => { 
    d.name = 'Entity ' + d['id']
  })
  return data

}

const NetworkPage = () => {

  const [data, setData] = useState({ nodes: processData(graph.nodes), links: graph.links })
  const [loading, setLoading] = useState({ loading: true })
  
  const initialState = {
    id: Consts.ROOT_ID,
    name: Consts.NAME,
    date: Consts.currentDate, 
    nodes: data.nodes, 
    links: data.links
  }

  const [current, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    setTimeout(function(){
      setLoading({ loading: false })
    }, 500)
  }, [data])

  return(
    <React.Fragment>
    <Header />
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

        <NetworkContext.Provider value={{ current, dispatch }}>
          { loading.loading === false && <Network /> }
        </NetworkContext.Provider>

      </div>
    </div>
    </React.Fragment>
  )
}

export default NetworkPage
