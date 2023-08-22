import React from "react"
import Header from "./components/Shared/Header"

const OurProcessPage = () => {
  return (
    <React.Fragment>
      <Header/>
      <div className="App__wrapper">
        <div className='App_container-textonly'>
          <h1>Our Process</h1>
          <p>There were several methodological steps involved in developing the A-VO-SP Map. First, we had to identify the dimensions that made up the theoretical framework of the A-VO-SP Map. After that, we had to develop a codebook to conduct the content analysis to map the empirical articles onto the A-VO-SP Map. Below, you can see a summarized explanation of how these steps were completed. </p>
          
          <b>Framework Development – A Meta-Review of Sustainability Marketing</b>
          <p>We utilized the meta-review methodology to develop the A-VO-SP framework. The goal of this method is to synthesize, combine, and interpret research with a meta-theoretical approach rather than focusing on individual primary effects (Breslin & Gatrell, 2020; Hallinger, 2021; Paré et al., 2015; Saeri et al., 2022). Hence, for this step, we only focused on conceptual sustainability marketing articles, and not empirical articles, as we were aiming to develop theoretical unity rather than effect-based understanding.</p>
          <p>Our sample was collected using the search terms “sustainab*” and “marketing” in Web of Science and Scopus, generating over 10,000 articles that were distilled down to 43 seminal conceptual articles in sustainability marketing. Then, using qualitative directed content analysis and the Atlas.ti software, we these articles along emergent code groups. From this process, we found the themes of Actors, Value Orientations and Sustainability Positioning that encapsulated the theoretical offerings of these articles. For the full methodological process, please refer to the manuscript.</p>

          <b>A-VO-SP Map – Codebook Development & Mapping Empirical Articles </b>
          <p>Following the identification of the unifying dimensions, we then moved to map 41 empirical articles from six of the top journals in the marketing field, the Journal of Marketing, Journal of the Academy of Marketing Science, the Journal of Consumer Research, Journal of Consumer Psychology, Journal of Marketing Research and Marketing Science (de Ruyter et al., 2019).</p>
          <p>To do this, we first had to develop a codebook. This step was aided by the prior identification of the A-VO-SP dimensions through conceptual work. Hence, although this was a reiterative process to reach the optimum level of reliability of our codebook across coders, the foundation of the codebook had already been built. Our coders were trained for eight hours and conducted a pilot and second pilot test phase, reaching high Krippendorf reliability levels. All articles were then coded based on the final version of the codebook, and the pilot articles were recoded to preserve the sample size. Following this coding process, the results were handed over to the web developer to build the A-VO-SP Map that you see here.</p>
          <p>The additional Try It Yourself functionality that is currently being piloted is also based heavily on the codebook developed in this phase. </p>
        </div>
    </div>
    </React.Fragment>
  )
}

export default OurProcessPage