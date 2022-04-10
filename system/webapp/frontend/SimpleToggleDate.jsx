/*
SimpleToggleDate.jsx
This one displays actual text
*/

var React = require('react');

import moment from 'moment'


export default class SimpleToggleDate extends React.Component{

  constructor(props) {
    super(props);
    this.state = {show: false}
  }

  showTooltip(bool) {
    this.setState({ show: bool })
  }

  i2div(n){

      var mx = 5
      if(n > mx){
        n = mx
      }
      var ix = Math.floor(n/mx * 255)

      return(<div style={{"width":"12px",
                          "border": ".5px solid grey", 
                          "height":"12px",
                          "marginTop":"4.5px",
                          "backgroundColor": window.cscale[ix],
                          "float":"left",
                          "overflow":"hidden"}}></div>)
    }
    
  i2pd(pd){
    return(<div style={{"width":"55px", "fontSize": "11px", "float":"left", "overflow":"hidden"}}>
                <span>{moment(pd).format("MMM DD, YYYY")}</span>
          </div>)
  }

  render(){
    let bb = this.i2div(this.props.nmentions)
    let cc = this.i2pd(this.props.pubdate)
    let bbcc = <span style={{"height":"100%", 'width': '100%'}}>{bb}{cc}</span>
    return(<div style={this.props.style}>{bbcc}</div>)
  }

}
