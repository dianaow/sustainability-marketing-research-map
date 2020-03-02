import React from "react"
import { BrowserRouter, Route } from "react-router-dom";
import MainPage from "./MainPage"
import NetworkPage from "./NetworkPage"

import 'semantic-ui-css/semantic.min.css'
import "./styles.css"

const App = () => {

  return (
    <div className="App">
      <BrowserRouter>
        <Route path="/" exact component={MainPage} />
        <Route path="/network" component={NetworkPage} />
      </BrowserRouter>
    </div>
  )

}

export default App

