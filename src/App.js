import React from "react"
import { BrowserRouter, Route } from "react-router-dom";
import MainPage from "./MainPage"
import TIYPage from "./TIYPage"
import OurProcessPage from "./OurProcessPage"
import ContactPage from "./ContactPage"
import FutureWorkPage from "./FutureWorkPage"
import 'semantic-ui-css/semantic.min.css'
import "./styles.css"

const App = () => {

  return (
    <div className="App">
      <BrowserRouter>
        <Route path="/" exact component={MainPage} />
        <Route path="/tryityourself" exact component={TIYPage} />
        <Route path="/ourprocess" exact component={OurProcessPage} />
        <Route path="/futurework" exact component={FutureWorkPage} />
        <Route path="/contact" exact component={ContactPage} />
      </BrowserRouter>
    </div>
  )

}

export default App

