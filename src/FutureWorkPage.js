import React from "react"
import Header from "./components/Shared/Header"

const FutureWorkPage = () => {
  return (
    <React.Fragment>
      <Header/>
      <div className="App__wrapper">
        <div className='App_container-textonly'>
          <h1>Future Work</h1>

          <b>Automating Mapping of Existent Research</b>
          <p>Future efforts could focus on developing an NLP model that can accurately and reliably map existent sustainability marketing research onto the A-VO-SP Map. This would make the mapping process more efficient as it removes the need for individual coders to physically read through extensive research papers, and also makes it more reliable as the process is more objective.</p>

          <b>Automating Mapping of Research Ideas/Professional Work </b>
          <p>Another area of the A-VO-SP Map that would benefit from automation would be in the piloted Try It Yourself part of the tool. Rather than users manually answering questions that place their work onto the map, automation here would use the same technology that automatically maps existent research to map novel work onto the map. This would be a further development of the first automation opportunity. </p>

          <b>Real-time Updating</b>
          <p>The tool can be further developed to increase the dynamism. For example, to provide a more accurate picture of the articles that are placed on the map, the citation count can be constantly updated. Hence, the node sizes will correctly present the impact of each article.</p>

          <b>Prototyping With Other Stakeholder Groups </b>
          <p>The A-VO-SP Map also has potential to be further developed for use with other stakeholder groups beyond researchers, academics, marketeers, and other business practitioners. For example, this could be useful for institutional actors such as NGOs, policy makers, universities, and many more. This could also be adapted for consumer use, for example, to visually understand how certain brands perform across these dimensions. </p>
          <br></br>
          <p>If these opportunities are of interest, please do not hesitate to reach out to us via the Contact Us page. Alternatively, if you have feedback, questions, or points of concern, please also feel free to reach out to us via the Contact Us page as well. </p>
        </div>
      </div>
    </React.Fragment>
  )
}

export default FutureWorkPage