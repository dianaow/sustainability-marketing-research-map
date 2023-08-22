import React, { useState, useEffect } from "react"
import * as d3 from "d3"
import { Popup, Button, Dropdown } from "semantic-ui-react";
import scores from './data/scores.json';
import papers from './data/final_papers.json';

import Slider from "./components/Shared/slider/Slider"
import Header from "./components/Shared/Header"
import RadarChart from "./components/Main/RadarScatter"
import { TooltipContext } from "./components/Main/Tooltip";
import Legend from './components/Main/Legend'
import Table from "./components/Main/Table"
import { getPropertyName, cleanTopic, cleanCategory, onlyUnique }  from "./components/utils"

function renderLegendContent(name) {
  if (name === 'Actors') {
    return <div>
    <p>This dimension encompasses agents with varying capacities for sustainability action. We found three Actors:</p>
    <p>i. Consumers, functioning at the individual and micro-level</p>
    <p>ii. Businesses, operating as a group at the meso-level in capacity and agency</p>
    <p>iii. Institutions. covering the network of actors that function at the macro-level of capacity and agency, including policymakers, governments, non-governmental institutions, educational institutions, and researchers, amongst others</p>
    <p>Please refer to Our Process for more in-depth information.</p>
    </div>
  } else if (name === 'Value Orientations') {
    return <div>
    <p>Value Orientations reflect motivations, personal values, identity, collective norms, and feelings of responsibility. This dimension is split into three levels of abstraction. At the inner-most circle, each Actor is Self-Oriented in different capacities. </p>
    <p>At the base level, Consumers are found to be Self-Oriented. Here, Consumers pursue sustainable action for a variety of self-benefiting outcomes, including financial benefit, identity expression, altruism and the warm glow effect, feelings of agency, individualism, and convenience.</p>
    <p>Businesses are at their most self-benefitting at the Profit-Orientation, wherein if Businesses engage in sustainability practices, it ultimately increases their company's profitability. Here, Businesses use sustainability as a platform to maximise their profitability without actively engaging in the sustainability agenda, with any positive effects a by-product of profit maximisation. </p>
    <p>Institutions’ values are Growth-Oriented. Since our Institutional actor is a network of macro actors, Growth is a flexible concept synthesised across the sustainability marketing research that differs depending on the specific actor within this network.</p>
    <p>At the middle level, all Actors are Societally-Oriented; where Actors go beyond thinking of the most beneficial outcome for themselves, but for larger society. Environmental-Orientation lies in the outer circle, where Actors are oriented towards caring for non-human life and the environment.</p>
    </div>
  } else if (name === 'Sustainability Positioning') {
    return <div>
    <p>Finally, we propose Sustainability Positioning, a continuum from Very Weak to Very Strong. Weak Sustainability argues that natural capital is fully replaceable by manufactured capital and provides no more well-being to humans or non-humans than manufactured capital does. </p>
    <p>In this view, the loss of natural capital at the expense of economic growth is acceptable, allowing for capitalistic goals to be achieved without hindrance. Strong Sustainability argues that natural capital cannot be substituted by manufactured capital. When critical natural capital, for example, rare earth resources, are entirely consumed or lost in the case of extinct species, they can never be regained, regardless of the level of artificial capital invested. </p>
    <p>Therefore, strong sustainability argues that since some functions of society can only be achieved by the natural capital of the earth’s ecosystem, it deserves special protection. Please refer to Our Process for more in-depth information.</p>
    </div>
  }
}

const MainPage = () => {

  const initialTooltipState = { show: false, info: {}}
  const initialSearchState = { isSelected: false, isLoading: false, isOpen: false, results: [], value: '' }
  const [tooltip, setTooltip] = useState(initialTooltipState)
  const [data, setData] = useState([])
  const [search, setSearch] = useState(initialSearchState)

  const journalOptions = data.map(d => d.sourcetitle).filter(onlyUnique).map(d => {
    return {
      key: d,
      text: d,
      value: d
    }
  })

  const searchResultsOptions = data.sort((a, b) => a.label.trim() - b.label.trim()).map(d => d.label).filter(onlyUnique).map(d => {
    return {
      key: d,
      text: d,
      value: d
    }
  })

  const changeThresholds = (lower, upper) => {
    data.forEach(d => {
      if(d.year >= lower && d.year <= upper) {
        d.opacity = 1
      } else {
        d.opacity = 0.1
      }
    })
    setData([...data])
  }

  const handleResultSelect = (e, { result }) => {
    setSearch({ 
      isLoading: false, 
      isSelected: true, 
      isOpen: false, 
      value: result.title,
      results: [result]
    })
  }

  const handleOnChange = (e, { value }) => {
    data.forEach(d => {
      if(value.indexOf(d.sourcetitle) !== -1) {
        d.opacity = 1
      } else {
        d.opacity = 0.1
      }
    })
    if(value.length === 0){
      data.forEach(d => d.opacity = 1)   
    }
    setData([...data])
  }

  const handleSearchChange = (e, { value }) => {
    setSearch({ isLoading: false, isSelected: false, isOpen: false, value })
    // setSearch({ isLoading: true, isSelected: false, isOpen: true, value })
    // setTimeout(() => {
    //   if (value.length < 1) {
    //     setSearch(initialSearchState)
    //   } else {
    //     const uniqIDs = data.filter(d=>d.label.toLowerCase().indexOf(value.toLowerCase()) !== -1).map(d => d.label).filter(onlyUnique) // unique unitIDs that are similar or same as search text
    //     const results = uniqIDs.map(d => {
    //       return {
    //         title: d
    //       }
    //     })
    //     setSearch({
    //       isLoading: false,
    //       isSelected: false, 
    //       isOpen: true,
    //       results
    //     })
    //   }
    // }, 300)
  }

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
            label: paper.InGraphLabel.replaceAll('|', ','),
            authors: paper.Authors.replaceAll('|', ','),
            abstract: paper.Abstract.replaceAll('|', ','),
            title: paper.Title.replaceAll('|', ','),
            url: paper.Link,
            sourcetitle: paper.Sourcetitle,
            year: +paper.Year,
            opacity: 1
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
    
    setData(aggData)
  }, [])

  const { isLoading, value, results } = search

  return(
    <React.Fragment>
    <Header/>
    <div className="App__wrapper">
      <div className='App_container'>
        <div className ='SideBarLeft'>
          <div className="Title">
            <h1>The A-VO-SP Map</h1>
          </div>
          <Slider changeThresholds={changeThresholds} active={true} /> 
          <div className="Search">
            {/* <Search
              icon="search"
              placeholder="SEARCH FOR A PAPER"
              size='large'
              fluid
              loading={isLoading}
              onResultSelect={handleResultSelect}
              onSearchChange={handleSearchChange}
              results={results}
              value={value} /> */}
            <h3>Search for a paper</h3>
            <Dropdown
              placeholder=''
              fluid
              search
              selection
              clearable
              options={searchResultsOptions}
              onChange={handleSearchChange}
            />
          </div>
          <div className="Search">
          <h3 style={{margin: '10px 0px', textAlign: 'left'}}>Filter by Journal</h3>
            <Dropdown
              placeholder=''
              fluid
              multiple
              search
              selection
              options={journalOptions}
              onChange={handleOnChange}
            />
          </div>
          {/* <Legend data={data.map(d => d.color).filter(onlyUnique).filter(d => d !== 'Other papers').sort()}/> */}
          <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
            <Table data={data} search={search} />
          </TooltipContext.Provider>
        </div>

        <div className ='Main'>
          <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
            <RadarChart 
              data={data} 
              search={search}
            />
            <div style={{display: "flex", padding: '10px'}}>
              {['Actors', 'Value Orientations', 'Sustainability Positioning'].map((item) => (
                <Popup
                  position='top center'
                  key={item}
                  header={item}
                  trigger={<Button>{item}</Button>}
                >
                  {renderLegendContent(item)}
                </Popup>
              ))}
            </div>
          </TooltipContext.Provider>
        </div>
      </div>
    </div>
    <div className="footer">
      <p style={{fontWeight: 700}}>Bibliography</p>
      <p>Brough, Aaron R., James E.B. Wilkie, Jingjing Ma, Mathew S. Isaac, and David Gal. 2016. “The Green-Feminine Stereotype and Its Effect on Sustainable Consumption.” Journal of Consumer Research 43 (4): 567–82. https://doi.org/10.1093/jcr/ucw044.</p>
      <p>Catlin, Jesse R., and Yitong Wang. 2013. “Recycling Gone Bad: When the Option to Recycle Increases Resource Consumption.” Journal of Consumer Psychology 23 (1): 122–27. https://doi.org/10.1016/j.jcps.2012.04.001.</p>
      <p>Chen, Yubo, Mrinal Ghosh, Yong Liu, and Liang Zhao. 2019. “Media Coverage of Climate Change and Sustainable Product Consumption: Evidence from the Hybrid Vehicle Market.” Journal of Marketing Research 56 (6): 995–1011. https://doi.org/10.1177/0022243719865898.</p>
      <p>Chernev, Alexander, and Sean Blair. 2021. “When Sustainability Is Not a Liability: The Halo Effect of Marketplace Morality.” Journal of Consumer Psychology 31 (3): 551–69. https://doi.org/10.1002/jcpy.1195.</p>
      <p>Edinger-Schons, Laura Marie, Jenni Sipilä, Sankar Sen, Gina Mende, and Jan Wieseke. 2018. “Are Two Reasons Better Than One? The Role of Appeal Type in Consumer Responses to Sustainable Products.” Journal of Consumer Psychology 28 (4): 644–64. https://doi.org/10.1002/jcpy.1032.</p>
      <p>Friske, Wesley, Seth A. Hoelscher, and Atanas Nik Nikolov. 2022. “The Impact of Voluntary Sustainability Reporting on Firm Value: Insights from Signaling Theory.” Journal of the Academy of Marketing Science. https://doi.org/10.1007/s11747-022-00879-2.</p>
      <p>Giebelhausen, Michael, Hae Eun Helen Chun, J. Joseph Cronin, and G. Tomas M. Hult. 2016. “Adjusting the Warm-Glow Thermostat: How Incentivizing Participation in Voluntary Green Programs Moderates Their Impact on Service Satisfaction.” Journal of Marketing 80 (4): 56–71. https://doi.org/10.1509/jm.14.0497.</p>
      <p>Gielens, Katrijn, Inge Geyskens, Barbara Deleersnyder, and Max Nohe. 2018. “The New Regulator in Town: The Effect of Walmart’s Sustainability Mandate on Supplier Shareholder Value.” Journal of Marketing 82 (2): 124–41. https://doi.org/10.1509/jm.16.0276.</p>
      <p>Godfrey, D. Matthew, Linda L. Price, and Robert F. Lusch. 2022. “Repair, Consumption, and Sustainability: Fixing Fragile Objects and Maintaining Consumer Practices.” Journal of Consumer Research 49 (2): 229–51. https://doi.org/10.1093/jcr/ucab067.</p>
      <p>Gollnhofer, Johanna F., Henri A. Weijo, and John W. Schouten. 2019. “Consumer Movements and Value Regimes: Fighting Food Waste in Germany by Building Alternative Object Pathways.” Journal of Consumer Research 46 (3): 460–82. https://doi.org/10.1093/jcr/ucz004.</p>
      <p>Gonzalez-Arcos, Claudia, Alison M. Joubert, Daiane Scaraboto, Rodrigo Guesalaga, and Jörgen Sandberg. 2021. “‘How Do I Carry All This Now?’ Understanding Consumer Resistance to Sustainability Interventions.” Journal of Marketing 85 (3): 44–61. https://doi.org/10.1177/0022242921992052.</p>
      <p>Haws, Kelly L., Karen Page Winterich, and Rebecca Walker Naylor. 2014. “Seeing the World through GREEN-Tinted Glasses: Green Consumption Values and Responses to Environmentally Friendly Products.” Journal of Consumer Psychology 24 (3): 336–54. https://doi.org/10.1016/j.jcps.2013.11.002.</p>
      <p>He, Cheng, O. Cem Ozturk, Chris Gu, and Jorge Mario Silva-Risso. 2021. “The End of the Express Road for Hybrid Vehicles: Can Governments’ Green Product Incentives Backfire?” Marketing Science 40 (1): 80–100. https://doi.org/10.1287/mksc.2020.1239.</p>
      <p>Hensen, Niek, Debbie I. Keeling, Ko de Ruyter, Martin Wetzels, and Ad de Jong. 2016. “Making SENS: Exploring the Antecedents and Impact of Store Environmental Stewardship Climate.” Journal of the Academy of Marketing Science 44 (4): 497–515. https://doi.org/10.1007/s11747-015-0446-5.</p>
      <p>Iyer, Ganesh, and David A. Soberman. 2016. “Social Responsibility and Product Innovation.” Marketing Science 35 (5): 727–42. https://doi.org/10.1287/mksc.2015.0975.</p>
      <p>Karmarkar, Uma R., and Bryan Bollinger. 2015. “BYOB: How Bringing Your Own Shopping Bags Leads to Treating Yourself and the Environment.” Journal of Marketing 79 (4): 1–15. https://doi.org/10.1509/jm.13.0228.</p>
      <p>Katsikeas, Constantine S., Constantinos N. Leonidou, and Athina Zeriti. 2016. “Eco-Friendly Product Development Strategy: Antecedents, Outcomes, and Contingent Effects.” Journal of the Academy of Marketing Science 44 (6): 660–84. https://doi.org/10.1007/s11747-015-0470-5.</p>
      <p>Kidwell, Blair, Adam Farmer, and David M. Hardesty. 2013. “Getting Liberals and Conservatives to Go Green: Political Ideology and Congruent Appeals.” Journal of Consumer Research 40 (2): 350–67. https://doi.org/10.1086/670610.</p>
      <p>Leonidou, Constantinos N., Constantine S. Katsikeas, and Neil A. Morgan. 2013. “‘Greening’ the Marketing Mix: Do Firms Do It and Does It Pay Off?” Journal of the Academy of Marketing Science 41 (2): 151–70. https://doi.org/10.1007/s11747-012-0317-2.</p>
      <p>Luchs, Michael G, Rebecca Walker Naylor, Julie R Irwin, Rajagopal Raghunathan, and Rajagopal Raghunathan is Asso-ciate Professor of Marketing. 2010. “The Sustainability Liability: Potential Negative Effects of Ethicality on Product Preference.” Journal of Marketing 74: 18–31.</p>
      <p>Mookerjee, Siddhanth, Yann Cornil, and Jo Andrea Hoegg. 2021. “From Waste to Taste: How ‘Ugly’ Labels Can Increase Purchase of Unattractive Produce.” Journal of Marketing 85 (3): 62–77. https://doi.org/10.1177/0022242920988656.</p>
      <p>Nickerson, Dionne, Michael Lowe, Adithya Pattabhiramaiah, and Alina Sorescu. 2022. “The Impact of Corporate Social Responsibility on Brand Sales: An Accountability Perspective.” Journal of Marketing 86 (2): 5–28. https://doi.org/10.1177/00222429211044155.</p>
      <p>Olsen, Mitchell C, Rebecca J Slotegraaf, and Sandeep R Chandukala. 2014. “Green Claims and Message Frames: How Green New Products Change Brand Attitude.” Journal of Marketing.</p>
      <p>Olson, Erik L. 2013. “It’s Not Easy Being Green: The Effects of Attribute Tradeoffs on Green Product Preference and Choice.” Journal of the Academy of Marketing Science 41 (2): 171–84. https://doi.org/10.1007/s11747-012-0305-6.</p>
      <p>Paharia, Neeru. 2020. “Who Receives Credit or Blame? The Effects of Made-to-Order Production on Responses to Unethical and Ethical Company Production Practices.” Journal of Marketing 84 (1): 88–104. https://doi.org/10.1177/0022242919887161.</p>
      <p>Peloza, John, Katherine White, and Jingzhi Shang. 2013. “Good and Guilt-Free: The Role of Self-Accountability in Influencing Preferences for Products with Ethical Attributes.” Journal of Marketing 77: 104–19.</p>
      <p>Reczek, Rebecca Walker, Julie R. Irwin, Daniel M. Zane, and Kristine R. Ehrich. 2018. “That’s Not How i Remember It: Willfully Ignorant Memory for Ethical Product Attribute Information.” Journal of Consumer Research 45 (1): 185–207. https://doi.org/10.1093/jcr/ucx120.</p>
      <p>Ross, Gretchen R., Margaret G. Meloy, and Lisa E. Bolton. 2021. “Disorder and Downsizing.” Journal of Consumer Research 47 (6): 959–77. https://doi.org/10.1093/jcr/ucaa051.</p>
      <p>Salnikova, Ekaterina, Yuliya Strizhakova, and Robin A. Coulter. 2022. “Engaging Consumers with Environmental Sustainability Initiatives: Consumer Global–Local Identity and Global Brand Messaging.” Journal of Marketing Research 59 (5): 983–1001. https://doi.org/10.1177/00222437221078522.</p>
      <p>Sipilä, Jenni, Sascha Alavi, Laura Marie Edinger-Schons, Sabrina Dörfer, and Christian Schmitz. 2021. “Corporate Social Responsibility in Luxury Contexts: Potential Pitfalls and How to Overcome Them.” Journal of the Academy of Marketing Science 49: 280–303. https://doi.org/10.1007/s11747-020-00755-x/Published.</p>
      <p>Sun, Jennifer J., Silvia Bellezza, and Neeru Paharia. 2021. “Buy Less, Buy Luxury: Understanding and Overcoming Product Durability Neglect for Sustainable Consumption.” Journal of Marketing 85 (3): 28–43. https://doi.org/10.1177/0022242921993172.</p>
      <p>Sun, Monic, and Remi Trudel. 2017. “The Effect of Recycling versus Trashing on Consumption: Theory and Experimental Evidence.” Journal of Marketing Research 54 (2): 293–305. https://doi.org/10.1509/jmr.15.0574.</p>
      <p>Tezer, Ali, and H. Onur Bodur. 2021. “The Greenconsumption Effect: How Using Green Products Improves Consumption Experience.” Journal of Consumer Research 47 (1): 25–39. https://doi.org/10.1093/JCR/UCZ045.</p>
      <p>Trudel, Remi, Jennifer J. Arg, and Matthew D. Meng. 2016. “The Recycled Self: Consumers’ Disposal Decisions of Identity-Linked Products.” Journal of Consumer Research 43 (2): 246–64. https://doi.org/10.1093/jcr/ucw014.</p>
      <p>Visser-Amundson, Anna de, John Peloza, and Mirella Kleijnen. 2021. “How Association with Physical Waste Attenuates Consumer Preferences for Rescue-Based Food.” Journal of Marketing Research 58 (5): 870–87. https://doi.org/10.1177/00222437211031243.</p>
      <p>Wang, Wenbo, Aradhna Krishna, and Brent McFerran. 2017. “Turning off the Lights: Consumers’ Environmental Efforts Depend on Visible Efforts of Firms.” Journal of Marketing Research 54 (3): 478–94. https://doi.org/10.1509/jmr.14.0441.</p>
      <p>White, Katherine, Bonnie Simpson, Jennifer Argo, Darren W Dahl, Lea Dunn, Joey Hoegg, and John Peloza. 2013. “When Do (and Don’t) Normative Appeals Influence Sustainable Consumer Behaviors?” Journal of Marketing 77: 78–95.</p>
      <p>Winterich, Karen Page, Gergana Y. Nenkov, and Gabriel E. Gonzales. 2019. “Knowing What It Makes: How Product Transformation Salience Increases Recycling.” Journal of Marketing 83 (4): 21–37. https://doi.org/10.1177/0022242919842167.</p>
      <p>Yan, Li, Hean Tat Keh, and Jiemiao Chen. 2021. “Assimilating and Differentiating: The Curvilinear Effect of Social Class on Green Consumption.” Journal of Consumer Research 47 (6): 914–36. https://doi.org/10.1093/jcr/ucaa041.</p>
      <p>Zane, Daniel M., Julie R. Irwin, and Rebecca Walker Reczek. 2016. “Do Less Ethical Consumers Denigrate More Ethical Consumers? The Effect of Willful Ignorance on Judgments of Others.” Journal of Consumer Psychology 26 (3): 337–49. https://doi.org/10.1016/j.jcps.2015.10.002.</p>
      <p>Zhang, Wanqing, Pradeep K. Chintagunta, and Manohar U. Kalwani. 2021. “Social Media, Influencers, and Adoption of an Eco-Friendly Product: Field Experiment Evidence from Rural China.” Journal of Marketing 85 (3): 10–27. https://doi.org/10.1177/0022242920985784.</p>
    </div>
    </React.Fragment>
  )

}

export default MainPage
