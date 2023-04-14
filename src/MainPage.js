import React, { useState, useEffect } from "react"
import * as d3 from "d3"
import { Search, Dropdown } from "semantic-ui-react";
import scores from './data/scores.json';
import papers from './data/final_papers.json';

import Slider from "./components/Shared/slider/Slider"
import Header from "./components/Shared/Header"
import RadarChart from "./components/Main/RadarScatter"
import { TooltipContext } from "./components/Main/Tooltip";
import Legend from './components/Main/Legend'
import Table from "./components/Main/Table"
import { getPropertyName, cleanTopic, cleanCategory, onlyUnique }  from "./components/utils"

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

  const searchResultsOptions = data.map(d => d.label).filter(onlyUnique).map(d => {
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
      <div className ='SideBarLeft'>
        <div className="Title">
          <h1>The A-VO-SP Map</h1>
        </div>
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
          <Dropdown
            placeholder=''
            fluid
            search
            selection
            options={searchResultsOptions}
            onChange={handleSearchChange}
          />
        </div>
        <Slider changeThresholds={changeThresholds} active={true} /> 
        <div className="Search">
        <h4 style={{margin: '10px 0px', textAlign: 'left'}}>Filter by Journal: </h4>
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
        </TooltipContext.Provider>
      </div>

    </div>
    <div className="footer">
      <p style={{fontWeight: 700}}>Bibliography</p>
      <p>Brough, A. R., Wilkie, J. E. B., Ma, J., Isaac, M. S., & Gal, D. (2016). The green-feminine stereotype and its effect on sustainable consumption. Journal of Consumer Research, 43(4), 567–582. https://doi.org/10.1093/jcr/ucw044</p>
      <p>Catlin, J. R., & Wang, Y. (2013). Recycling gone bad: When the option to recycle increases resource consumption. Journal of Consumer Psychology, 23(1), 122–127. https://doi.org/10.1016/j.jcps.2012.04.001</p>
      <p>Chen, Y., Ghosh, M., Liu, Y., & Zhao, L. (2019). Media Coverage of Climate Change and Sustainable Product Consumption: Evidence from the Hybrid Vehicle Market. Journal of Marketing Research, 56(6), 995–1011. https://doi.org/10.1177/0022243719865898</p>
      <p>Chernev, A., & Blair, S. (2021). When Sustainability is Not a Liability: The Halo Effect of Marketplace Morality. Journal of Consumer Psychology, 31(3), 551–569. https://doi.org/10.1002/jcpy.1195</p>
      <p>de Visser-Amundson, A., Peloza, J., & Kleijnen, M. (2021). How Association with Physical Waste Attenuates Consumer Preferences for Rescue-Based Food. Journal of Marketing Research, 58(5), 870–887. https://doi.org/10.1177/00222437211031243</p>
      <p>Edinger-Schons, L. M., Sipilä, J., Sen, S., Mende, G., & Wieseke, J. (2018). Are Two Reasons Better Than One? The Role of Appeal Type in Consumer Responses to Sustainable Products. Journal of Consumer Psychology, 28(4), 644–664. https://doi.org/10.1002/jcpy.1032</p>
      <p>Friske, W., Hoelscher, S. A., & Nikolov, A. N. (2022). The impact of voluntary sustainability reporting on firm value: Insights from signaling theory. Journal of the Academy of Marketing Science. https://doi.org/10.1007/s11747-022-00879-2</p>
      <p>Giebelhausen, M., Chun, H. E. H., Cronin, J. J., & Hult, G. T. M. (2016). Adjusting the warm-glow thermostat: How incentivizing participation in voluntary green programs moderates their impact on service satisfaction. Journal of Marketing, 80(4), 56–71. https://doi.org/10.1509/jm.14.0497</p>
      <p>Gielens, K., Geyskens, I., Deleersnyder, B., & Nohe, M. (2018). The new regulator in town: The effect of walmart’s sustainability mandate on supplier shareholder value. Journal of Marketing, 82(2), 124–141. https://doi.org/10.1509/jm.16.0276</p>
      <p>Godfrey, D. M., Price, L. L., & Lusch, R. F. (2022). Repair, Consumption, and Sustainability: Fixing Fragile Objects and Maintaining Consumer Practices. Journal of Consumer Research, 49(2), 229–251. https://doi.org/10.1093/jcr/ucab067</p>
      <p>Gollnhofer, J. F., Weijo, H. A., & Schouten, J. W. (2019). Consumer Movements and Value Regimes: Fighting Food Waste in Germany by Building Alternative Object Pathways. Journal of Consumer Research, 46(3), 460–482. https://doi.org/10.1093/jcr/ucz004</p>
      <p>Gonzalez-Arcos, C., Joubert, A. M., Scaraboto, D., Guesalaga, R., & Sandberg, J. (2021). “How Do I Carry All This Now?” Understanding Consumer Resistance to Sustainability Interventions. Journal of Marketing, 85(3), 44–61. https://doi.org/10.1177/0022242921992052</p>
      <p>Haws, K. L., Winterich, K. P., & Naylor, R. W. (2014). Seeing the world through GREEN-tinted glasses: Green consumption values and responses to environmentally friendly products. Journal of Consumer Psychology, 24(3), 336–354. https://doi.org/10.1016/j.jcps.2013.11.002</p>
      <p>He, C., Ozturk, O. C., Gu, C., & Silva-Risso, J. M. (2021). The end of the express road for hybrid vehicles: Can governments’ green product incentives backfire? Marketing Science, 40(1), 80–100. https://doi.org/10.1287/mksc.2020.1239</p>
      <p>Hensen, N., Keeling, D. I., de Ruyter, K., Wetzels, M., & de Jong, A. (2016). Making SENS: exploring the antecedents and impact of store environmental stewardship climate. Journal of the Academy of Marketing Science, 44(4), 497–515. https://doi.org/10.1007/s11747-015-0446-5</p>
      <p>Iyer, G., & Soberman, D. A. (2016). Social responsibility and product innovation. Marketing Science, 35(5), 727–742. https://doi.org/10.1287/mksc.2015.0975</p>
      <p>Karmarkar, U. R., & Bollinger, B. (2015). BYOB: How bringing your own shopping bags leads to treating yourself and the environment. Journal of Marketing, 79(4), 1–15. https://doi.org/10.1509/jm.13.0228</p>
      <p>Katsikeas, C. S., Leonidou, C. N., & Zeriti, A. (2016). Eco-friendly product development strategy: antecedents, outcomes, and contingent effects. Journal of the Academy of Marketing Science, 44(6), 660–684. https://doi.org/10.1007/s11747-015-0470-5</p>
      <p>Kidwell, B., Farmer, A., & Hardesty, D. M. (2013). Getting liberals and conservatives to go green: Political ideology and congruent appeals. Journal of Consumer Research, 40(2), 350–367. https://doi.org/10.1086/670610</p>
      <p>Leonidou, C. N., Katsikeas, C. S., & Morgan, N. A. (2013). “Greening” the marketing mix: Do firms do it and does it pay off? Journal of the Academy of Marketing Science, 41(2), 151–170. https://doi.org/10.1007/s11747-012-0317-2</p>
      <p>Luchs, M. G., Walker Naylor, R., Irwin, J. R., Raghunathan, R., & Raghunathan is Asso-ciate Professor of Marketing, R. (2010). The Sustainability Liability: Potential Negative Effects of Ethicality on Product Preference. Journal of Marketing, 74, 18–31.</p>
      <p>Mookerjee, S., Cornil, Y., & Hoegg, J. A. (2021). From Waste to Taste: How “Ugly” Labels Can Increase Purchase of Unattractive Produce. Journal of Marketing, 85(3), 62–77. https://doi.org/10.1177/0022242920988656</p>
      <p>Nickerson, D., Lowe, M., Pattabhiramaiah, A., & Sorescu, A. (2022). The Impact of Corporate Social Responsibility on Brand Sales: An Accountability Perspective. Journal of Marketing, 86(2), 5–28. https://doi.org/10.1177/00222429211044155</p>
      <p>Olsen, M. C., Slotegraaf, R. J., & Chandukala, S. R. (2014). Green Claims and Message Frames: How Green New Products Change Brand Attitude. Journal of Marketing.
Olson, E. L. (2013). It’s not easy being green: The effects of attribute tradeoffs on green product preference and choice. Journal of the Academy of Marketing Science, 41(2), 171–184. https://doi.org/10.1007/s11747-012-0305-6</p>
      <p>Paharia, N. (2020). Who Receives Credit or Blame? The Effects of Made-to-Order Production on Responses to Unethical and Ethical Company Production Practices. Journal of Marketing, 84(1), 88–104. https://doi.org/10.1177/0022242919887161</p>
      <p>Peloza, J., White, K., & Shang, J. (2013). Good and Guilt-Free: The Role of Self-Accountability in Influencing Preferences for Products with Ethical Attributes. Journal of Marketing, 77, 104–119.</p>
      <p>Reczek, R. W., Irwin, J. R., Zane, D. M., & Ehrich, K. R. (2018). That’s Not How i Remember It: Willfully Ignorant Memory for Ethical Product Attribute Information. Journal of Consumer Research, 45(1), 185–207. https://doi.org/10.1093/jcr/ucx120</p>
      <p>Ross, G. R., Meloy, M. G., & Bolton, L. E. (2021). Disorder and Downsizing. Journal of Consumer Research, 47(6), 959–977. https://doi.org/10.1093/jcr/ucaa051</p>
      <p>Salnikova, E., Strizhakova, Y., & Coulter, R. A. (2022). Engaging Consumers with Environmental Sustainability Initiatives: Consumer Global–Local Identity and Global Brand Messaging. Journal of Marketing Research, 59(5), 983–1001. https://doi.org/10.1177/00222437221078522</p>
      <p>Sipilä, J., Alavi, S., Marie Edinger-Schons, L., Dörfer, S., & Schmitz, C. (2021). Corporate social responsibility in luxury contexts: potential pitfalls and how to overcome them. Journal of the Academy of Marketing Science, 49, 280–303. https://doi.org/10.1007/s11747-020-00755-x/Published</p>
      <p>Sun, J. J., Bellezza, S., & Paharia, N. (2021). Buy Less, Buy Luxury: Understanding and Overcoming Product Durability Neglect for Sustainable Consumption. Journal of Marketing, 85(3), 28–43. https://doi.org/10.1177/0022242921993172</p>
      <p>Sun, M., & Trudel, R. (2017). The effect of recycling versus trashing on consumption: Theory and experimental evidence. Journal of Marketing Research, 54(2), 293–305. https://doi.org/10.1509/jmr.15.0574</p>
      <p>Tezer, A., & Bodur, H. O. (2021). The greenconsumption effect: How using green products improves consumption experience. Journal of Consumer Research, 47(1), 25–39. https://doi.org/10.1093/JCR/UCZ045</p>
      <p>Trudel, R., Arg, J. J., & Meng, M. D. (2016). The recycled self: Consumers’ disposal decisions of identity-linked products. Journal of Consumer Research, 43(2), 246–264. https://doi.org/10.1093/jcr/ucw014</p>
      <p>Wang, W., Krishna, A., & McFerran, B. (2017). Turning off the lights: Consumers’ environmental efforts depend on visible efforts of firms. Journal of Marketing Research, 54(3), 478–494. https://doi.org/10.1509/jmr.14.0441</p>
      <p>White, K., Simpson, B., Argo, J., Dahl, D. W., Dunn, L., Hoegg, J., & Peloza, J. (2013). When Do (and Don’t) Normative Appeals Influence Sustainable Consumer Behaviors? Journal of Marketing, 77, 78–95.</p>
      <p>Winterich, K. P., Nenkov, G. Y., & Gonzales, G. E. (2019). Knowing What It Makes: How Product Transformation Salience Increases Recycling. Journal of Marketing, 83(4), 21–37. https://doi.org/10.1177/0022242919842167</p>
      <p>Yan, L., Keh, H. T., & Chen, J. (2021). Assimilating and Differentiating: The Curvilinear Effect of Social Class on Green Consumption. Journal of Consumer Research, 47(6), 914–936. https://doi.org/10.1093/jcr/ucaa041</p>
      <p>Zane, D. M., Irwin, J. R., & Reczek, R. W. (2016). Do less ethical consumers denigrate more ethical consumers? The effect of willful ignorance on judgments of others. Journal of Consumer Psychology, 26(3), 337–349. https://doi.org/10.1016/j.jcps.2015.10.002</p>
      <p>Zhang, W., Chintagunta, P. K., & Kalwani, M. U. (2021). Social Media, Influencers, and Adoption of an Eco-Friendly Product: Field Experiment Evidence from Rural China. Journal of Marketing, 85(3), 10–27. https://doi.org/10.1177/0022242920985784</p>
    </div>
    </React.Fragment>
  )

}

export default MainPage
