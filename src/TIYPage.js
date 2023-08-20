import React, { useState, useEffect } from "react"
import * as d3 from "d3"
import Header from "./components/Shared/Header"
import RadarChart from "./components/Main/RadarScatter"
import { Dropdown, Button, Popup, Icon, Input, } from "semantic-ui-react";
import { tagCategories, topicCategories } from "./components/consts"
import { getPropertyName, cleanTopic, cleanCategory }  from "./components/utils"

import scores from './data/scores.json';
import papers from './data/final_papers.json';
import html2canvas from "html2canvas";

const popupContent = [
  {
    key: 'Consumers', 
    tag: 'Self-Oriented',
    values: [
      'Self-Oriented here means that Consumers are making their consumption decisions while concerned with beneficial outcomes towards themselves. This can range from hedonic motivations, getting the best product at the best price for themselves, purchasing a certain product to boost their self-concept and identity, or consumption that involves impure altruism and the warm glow.',
      'Societally-Oriented here means Consumers are making consumptions decisions while concerned with beneficial outcomes towards other people in society. This includes benefits towards those in their direct community or local area, human rights regarding workers, employees and children, and the wellbeing of people unknown to them on the global scale. For example, purchasing products from fairtrade certified brands despite it costing more.',
      'Environmentally-Oriented here means that Consumers are making consumption decisions while concerned with beneficial outcomes towards nature and other non-human life. This includes conservation attempts and other environmentally-driven behaviour. For example, recycling waste rather than disposing in regular trash despite an inconvenience.'
    ]
  },
  {
    key: 'Businesses', 
    tag: 'Profit-Oriented',
    values: [
      'Profit-Oriented here means that Businesses are engaging in exchange of a product or service while concerned with profit maximization outcomes and the needs of direct consumers, shareholders and the (financial) health and competitiveness of the business. For example, prioritizing value creation over environmental initiatives, utilizing green marketing for competitive reasons, and cutting costs on labour to maximise profits.',
      'Societally-Oriented here means that Businesses are engaging in exchange of a product or service while concerned with beneficial outcomes towards society involving equity, equality, and social responsibility regarding, for example, human rights. An example of this would be businesses fairly paying their workers, ensuring their production practices do not harm local or native communities and that their products do not lead to negative consequences for larger society.',
      'Environmentally-Oriented here means that Businesses are engaging in exchange of a product or service while concerned with beneficial outcomes towards nature and other non-human life. For example, businesses ensuring a transparent and accountable supply chain to fully reflect and mitigate the climate impact of their production process, reducing unnecessary packaging and actively innovating for environmentally friendly alternatives.'
    ]
  },
  {
    key: 'Institutions', 
    tag: 'Growth-Oriented',
    values: [
      'Growth-Oriented here means that Institutions are facilitating exchange while concerned with maximizing the growth of key performance indicators that are relevant to the type of institutional actor concerned, such as GDP for government and constituency support for politicians, within existing structures. For example, continuing policies that enhance development and economic prosperity despite potential negative impact on society or the environment.',
      'Societally-Oriented here means that Institutions are facilitating exchange while concerned with beneficial outcomes towards society involving equity, equality and responsibility. For example, measuring wellbeing in more holistic ways, sanctioning business activities that encroach on human rights regardless of economic impact and promoting policies that unify communities and localities. ',
      'Environmentally-Oriented here means that Institutions are facilitating exchange while concerned with beneficial outcomes towards nature and other non-human life. For example, a university incorporating environmental responsibility into the core of a course curriculum, an NGO campaigning directly to raise awareness for environmental causes, and policy makers enacting strong policy for environmental protection.'
    ]
  }
]

const boolOptions = [
  {
    key: "Yes",
    text: "Yes",
    value: 1
  },
  {
    key: "No",
    text: "No",
    value: 0
  }
]

const valueOptions = ['Not Applicable', 'Very weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'].map((d,i) => {
  return {
    key: d,
    text: d,
    value: i
  }
})

const RBOptions = [
  {
    key: "Researcher",
    text: "Researcher",
    value: "Researcher"
  },
  {
    key: "Business",
    text: "Business",
    value: "Business"
  }
]


const TIYPage = () => {

  let timer
  const [form, setForm] = useState({})
  const [data, setData] = useState([])

  useEffect(() => {
    const keys = Object.keys(scores[0])
    const data = scores.map(d => {
      return keys.map(key => {
        let result = getPropertyName(d, o => o[key]).split('_')
        if(result[0] !== 'OVO' || result[2] === 'SP') return
        return {
          unitID: d.UnitID,
          coderID: d.CoderID,
          order: d.Order,
          topic: cleanTopic(result[1]),
          category: cleanCategory(result[2]),
          value: d['OVO_' + result[1] + '_' + result[2]] === "1" ? d['OVO_' + result[1] + '_SP'] : "" 
        }
      })
    }).flat().filter(d => d && d.category && d.topic && d.value !== "")
    
    const nested = d3.nest()
      .key(d => d.unitID)
      .key(d => d.topic)
      .key(d => d.category)
      .rollup(function(v) { return d3.mean(v, function(d) { return +d.value; }); })
      .entries(data)

    let aggData = []
    nested.forEach(a =>{
      const paper = papers.find(el => el.Code === a.key) || {}
      a.values.forEach(b => {
        b.values.forEach(c => {
          if(c.value )
          aggData.push({
            entity: a.key + '-' + b.key + '-' + c.key,
            unitID: a.key,
            topic: b.key,
            category: c.key,
            value: c.value,
            count: +paper.Citedby,
            label: paper.InGraphLabel.replace('|', ','),
            authors: paper.Authors.replace('|', ','),
            url: paper.Link,
            sourcetitle: paper.Sourcetitle,
            year: +paper.Year,
            opacity: 0.5
          })
        })
      })
    })

    const papersToColor = d3.nest()
      .key(d => d.unitID)
      .rollup(d => d.length)
      .entries(aggData)
      .sort(function(a,b) {return d3.descending(a.value,b.value);})
      .map(d => d.key)
      .slice(0, 10)

    aggData.forEach(d => {
      d.color = papersToColor.indexOf(d.unitID) !== -1 ? d.label : 'Other papers'
    })
    
    setData([])
  }, [])

  const handleNameChange = (e, { name, value }) => {
    const debounce = () => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				console.log('entering paper name')
        return setForm({...form, [name]: value})
			}, 750);
		}
		debounce()
  }
  
  //IF	Self	Society	Environment	THEN
  //YES	NO	NO	VERY WEAK
  //YES	NO	YES	WEAK
  //YES	YES	NO	WEAK
  //YES	YES	YES	MODERATE
  //NO	YES	YES	STRONG

  const handleChange = (value, key) => {
     setForm({ ...form, [key]: value });
    let newData = []
    topicCategories.forEach((topic,t) => {
      if(key === topic + '_SP'){
        tagCategories.forEach((category,c) => {
          if(form[topic + '_' + category]){
            console.log('value more 0', form, key, topic, category, value)
            if(value === 0 & form[topic + '_Self-Profit-Growth'] === 1 && form[topic + '_Society'] === 0 && form[topic + '_Environment'] === 0) value = 1
            if(value === 0 & form[topic + '_Self-Profit-Growth'] === 1 && form[topic + '_Society'] === 0 && form[topic + '_Environment'] === 1) value = 2
            if(value === 0 & form[topic + '_Self-Profit-Growth'] === 1 && form[topic + '_Society'] === 1 && form[topic + '_Environment'] === 0) value = 2
            if(value === 0 & form[topic + '_Self-Profit-Growth'] === 1 && form[topic + '_Society'] === 1 && form[topic + '_Environment'] === 1) value = 3
            if(value === 0 & form[topic + '_Self-Profit-Growth'] === 0 && form[topic + '_Society'] === 1 && form[topic + '_Environment'] === 1) value = 4
            newData.push({
              entity: key,
              topic,
              category,
              value,
              count: 10,
              label: form["name"],
              opacity: 1,
              color: 'New paper'     
            })
            setForm({ ...form, [t + '_' + c]: newData})
          }
        })
      } else {

      }
    })
  }

  const handleSubmit = () => {
    let newData = []
    topicCategories.forEach((topic,t) => {
      tagCategories.forEach((category,c) => {
        if(form[t + '_' + c]) newData.push(...form[t + '_' + c])
      })
    })
    setData([...data, ...newData])
  }

  const handleReset = (key) => {
    setData(data.filter(d => !(d.color === 'New paper')))
    setForm({})
    //const newData = data.filter(d => !(d.color === 'New paper' && d.topic === key))
    //setData(newData)
    //setForm({ ...form, [key]: 0, [key + '_SP']: null, [key + '_Self-Profit-Growth']: null,  [key + '_Society']: null, [key + '_Environment']: null });
  }

  const downloadAsImage = async() => {
    const canvas = await html2canvas(document.querySelector(".Main"));
    canvas.style.display = "none";
    document.body.appendChild(canvas);
    const image = canvas.toDataURL("image/jpg").replace("image/jpg", "image/octet-stream");
    const a = document.createElement("a");
    a.setAttribute("download", 'map.jpg');
    a.setAttribute("href", image);
    a.click();
    console.log('downloading image')
  }

  return(
    <React.Fragment>
      <Header/>
      <div className="App__wrapper">
        <div className ='SideBarLeft1'>
          <h4>Following this, you will be shown a simplified version of the codebook used by the researchers that allows you to get a rough idea of where your paper falls. However, if you’re interested in the nuance of your paper’s placement on the A-VO-SP Map, including the accurate Sustainability Positioning, please follow this link to the full codebook.</h4>
          <div style={{margin: '20px 0px'}}>
            <h4>Click on canvas to download it as an image</h4>
          </div>
          <div style={{overflow: 'scroll', height: '90vh'}}>
          <div style={{marginRight: '30px', marginTop: '20px'}}>
            <h4>Are you a Researcher or a Business?</h4>
            <Dropdown placeholder='' selection options={RBOptions} onChange={(e,{value})=>handleChange(value, 'researcher_or_biz')}/>
          </div>

          {form['researcher_or_biz'] === 'Researcher' && 
          <>
            <div style={{margin: '20px 0px', width: '50%'}}>
              <h4>How would you like to name your research in the A-VO-SP Map? </h4>
              <Input name='name' placeholder='Author names, Working title, Dependent variables, etc.' onChange={handleNameChange}></Input>
            </div>
            { topicCategories.map(topic => {
              return(
              <div style={{display: 'flex'}}>
                <div style={{marginRight: '30px', marginTop: '20px'}}>
                  <h4>Does your work involve {topic} as an Actor?</h4>
                  <Dropdown placeholder='' selection options={boolOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic)}/>
                </div>
                {form[topic] ?
                  <div>
                    <div style={{margin: '20px 0px'}}>
                      <div style={{display: 'flex'}}>
                        <h4>Are {topic} {popupContent.find(d => d.key === topic).tag} in your research?</h4>
                        <Popup
                          trigger={<Icon name='question circle' />}
                          content={popupContent.find(d => d.key === topic).values[0]}
                          size='mini'
                          position='top right'
                        />
                      </div>
                      <Dropdown placeholder='' selection options={boolOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic + '_Self-Profit-Growth')}/>
                    </div>
                    <div style={{margin: '20px 0px'}}>
                      <div style={{display: 'flex'}}>
                        <h4>Are {topic} Societally-Oriented in your research?</h4>
                        <Popup
                          trigger={<Icon name='question circle' />}
                          content={popupContent.find(d => d.key === topic).values[1]}
                          size='mini'
                          position='top right'
                        />
                      </div>
                      <Dropdown placeholder='' selection options={boolOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic + '_Society')} />
                    </div>
                    <div style={{margin: '20px 0px'}}>
                      <div style={{display: 'flex'}}>
                        <h4>Are {topic} Environmentally-Oriented in your research?</h4>
                        <Popup
                          trigger={<Icon name='question circle' />}
                          content={popupContent.find(d => d.key === topic).values[2]}
                          size='mini'
                          position='top right'
                        />
                      </div>
                      <Dropdown placeholder='' selection options={boolOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic + '_Environment')} />
                    </div>
                    <div style={{margin: '20px 0px'}}>
                      <h4>If using the full codebook, please also choose the appropriate Sustainability Positioning for the {topic} as defined in the codebook. If not, please choose Not Applicable and your work will be placed automatically based on your previous answers.</h4>
                      <Dropdown placeholder='' selection options={valueOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic + '_SP')} />
                    </div>
                  </div> : <div></div>
                }
              </div>)
            })}  
            <div style={{margin: '20px 0px'}}>
              <Button size='mini' onClick={(e)=> handleSubmit()}>Submit</Button>
              <Button size='mini' onClick={(e)=> handleReset()}>Reset</Button>
            </div>
            </>
          }     

          {form['researcher_or_biz'] === 'Business' && 
          <>
            <div style={{margin: '20px 0px', width: '50%'}}>
              <h4>How would you like to name your work in the A-VO-SP Map? </h4>
              <Input name='name' placeholder='Brand X’s Mission Statement, Initiative, Advertisement, etc' onChange={handleNameChange}></Input>
            </div>
            {topicCategories.map(topic => {
              return(
              <div style={{display: 'flex'}}>
                <div style={{marginRight: '30px', marginTop: '20px'}}>
                  <h4>Does your work involve {topic} taking action?</h4>
                  <Dropdown placeholder='' selection options={boolOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic)}/>
                </div>
                {form[topic] ?
                <div>
                  <div style={{margin: '20px 0px'}}>
                    <div style={{display: 'flex'}}>
                      <h4>Are your {topic} {topic === 'Consumers' ? '(required to be) ' : ''} {popupContent.find(d => d.key === topic).tag} in your work?</h4>
                      <Popup
                        trigger={<Icon name='question circle' />}
                        content={popupContent.find(d => d.key === topic).values[0]}
                        size='mini'
                        position='top right'
                      />
                    </div>
                    <Dropdown placeholder='' selection options={boolOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic + '_Self-Profit-Growth')}/>
                  </div>
                  <div style={{margin: '20px 0px'}}>
                    <div style={{display: 'flex'}}>
                      <h4>Are your {topic} {topic === 'Consumers' ? '(required to be) ' : ''} Societally-Oriented in your work?</h4>
                      <Popup
                        trigger={<Icon name='question circle' />}
                        content={popupContent.find(d => d.key === topic).values[1]}
                        size='mini'
                        position='top right'
                      />
                    </div>
                    <Dropdown placeholder='' selection options={boolOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic + '_Society')} />
                  </div>
                  <div style={{margin: '20px 0px'}}>
                    <div style={{display: 'flex'}}>
                      <h4>Are your {topic} {topic === 'Consumers' ? '(required to be) ' : ''} Environmentally-Oriented in your work?</h4>
                      <Popup
                        trigger={<Icon name='question circle' />}
                        content={popupContent.find(d => d.key === topic).values[2]}
                        size='mini'
                        position='top right'
                      />
                    </div>
                    <Dropdown placeholder='' selection options={boolOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic + '_Environment')} />
                  </div>
                  <div style={{margin: '20px 0px'}}>
                    <h4>If using the full codebook, please also choose the appropriate Sustainability Positioning for the {topic} as defined in the codebook. If not, please choose Not Applicable and your work will be placed automatically based on your previous answers.</h4>
                    <Dropdown placeholder='' selection options={valueOptions} disabled={form[topic + '_SP'] > 0 ? true : false} onChange={(e,{value})=>handleChange(value, topic + '_SP')} />
                  </div>
                </div> : <div></div>
                }
              </div>)
            })}
            <div style={{margin: '0px 0px 30px 0px'}}>
              <Button size='mini' onClick={(e)=> handleReset()}>Reset</Button>
              <Button size='mini' onClick={(e)=> handleSubmit()}>Submit</Button>
            </div>
          </>
          }

        </div>
      </div>
      <div className ='Main' onClick={downloadAsImage}>
        <div style={{position:'absolute', top: '47%', width: '250px'}}><h4 style={{textAlign:'center', color: 'white'}}>{form.name || ""}</h4></div>
        <RadarChart 
          data={data} 
          search={{ isSelected: false, isLoading: false, isOpen: false, results: [], value: '' }}
        />
      </div>
    </div>
    </React.Fragment>
  )
}

export default TIYPage