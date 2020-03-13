import React, { useState, useEffect, useReducer, createContext } from "react"
import { Dimmer, Loader, Image, Segment, Icon } from 'semantic-ui-react'

import graph from './data/test_graph.json';
import Header from "./components/Shared/Header"
import Card from "./components/Network/Card"
import Network from "./components/Network/NetworkSection"

import reducer from "./components/reducers/NetworkReducer"

import * as Consts from "./components/consts"
import { getRandomArbitrary }  from "./components/utils"
import { formatFullDate }  from "./components/consts"

import "./styles_network.scss"

const faker = require('faker');

export const NetworkContext = createContext()

const entityData = {
  entity: Consts.ROOT_ID,
  name: Consts.NAME,
  full_name: 'John Doe Silva',
  dob: '10 January 1953',
  nationality: 'Portugal',
  image: '../data/najib_razak.jpg',
  key_lists: [{'title': 'PEP Tier 1', 'type': 'watch', 'start_time': '01/01/00', 'end_time': 'NA'}],
  key_positions: [
    {'title': 'CEO, North Star Overseas Enterprises Inc', 'country': 'Portugal', 'start_time': '03/04/09', 'end_time': '10/05/18'},
    {'title': 'President, Stichting Fuchs Family Charity', 'country': 'Spain', 'start_time': '26/03/09', 'end_time': '12/05/18'},
    {'title': 'Director, Hunt Oil Company', 'country': 'Spain', 'start_time': '07/01/04', 'end_time': '01/04/09'}
  ],
  events: createEvents(12)
}

function processNodes(data) {

  data.forEach((d,i) => { 
    d.name = faker.name.firstName() + " " + faker.name.lastName()
    d.countries = Consts.countries[getRandomArbitrary(0,5)]
    d.events = createEvents(getRandomArbitrary(0,3))
    d.persona = d.id === Consts.ROOT_ID ? 'Actor' : Consts.persona[getRandomArbitrary(0,5)]
  })
  return data

}

function processLinks(nodes, links) {

  links.forEach((d,i) => {
    let startEntityType = nodes.find(el=>el.id == d.start_id).node_type 
    let endEntityType = nodes.find(el=>el.id == d.end_id).node_type
    if(startEntityType == 'organization' & endEntityType == 'organization'){
      d.link = 'subsidiary of'
    } else if (startEntityType == 'organization' & endEntityType == 'person'){
      d.link = 'investor of'
    } else if (startEntityType == 'person' & endEntityType == 'organization'){
      d.link = Consts.org_relationships[getRandomArbitrary(0,2)]
    } else if (startEntityType == 'person' & endEntityType == 'person'){
      d.link = Consts.people_relationships[getRandomArbitrary(0,4)]
    } else {
      d.link = 'connected to'
    }
  })
  return links

}

// Fake events for each entity. These are recent events happening for each entity which are connected/associated to root node
// In actual, tooltip component will receive data of all events related to root node, then breakdown events by each entity connected to root node
function createEvents(num) {
  let events = []
  let transactionType = ['Has Received: ', 'Has Sent: ']
  let eventType = ['Has Bank Account', 'Has Registered Address']
  let address = faker.address.streetAddress("###") + ", " + faker.address.city() + ', ' + faker.address.country()
  let bank_account = faker.finance.accountName() + ": " + faker.finance.account()
  for (let i = 0; i <= num; i++) {
    events.push({
      type: 'Bank Transaction',
      description: transactionType[getRandomArbitrary(0,1)] + faker.finance.amount(1000,10000,1,"$"),
      date: faker.date.between('2016-01-01', '2019-12-31')
    })
  }
  let type = eventType[getRandomArbitrary(0,1)]
  events.push({
    type: type,
    description: type === 'Has Bank Account' ? bank_account : address,
    date: faker.date.between('2016-01-01', '2019-12-31')
  })
  // sort events by datetime in descending order
  events = events.sort(function(a,b){ return b.date - a.date })
  // convert date to string
  events.forEach(d=>{
    d.date = formatFullDate(d.date)
  })

  return events
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

  const [data, setData] = useState({ nodes: processNodes(graph.nodes), links: processLinks(graph.nodes, graph.links) })
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
    //setTimeout(function(){
      setLoading({ loading: false })
    //}, 500)
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
