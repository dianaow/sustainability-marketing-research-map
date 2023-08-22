import React from "react"
import { Link } from "react-router-dom";

const Header = () => (
  <div className="Header">
    <div className='headerWrapper'>
      <Link to='/'>
        <div>THE MAP</div>
      </Link>
      <Link to='/tryityourself'>
        <div>TRY IT YOURSELF</div>
      </Link>
      <Link to='/ourprocess'>
        <div>OUR PROCESS</div>
      </Link>
      <Link to='/futurework'>
        <div>FUTURE WORK</div>
      </Link>
      <Link to='/contact'>
        <div>CONTACT</div>
      </Link>
    </div>
  </div>
)

export default Header
