// @flow

'use strict';
/*

*/

var React = require('react');
import moment from 'moment'


export default class CollapseButton extends React.Component<Props, State>{

  constructor(props: Props) {
    super(props);
  }

  render() {

    let color = "black"

    if(this.props.is_read && !this.props.is_focal && ! this.props.is_global){
      color = window.readcolor
    }

    let button_txt = <span className="expandcontract" onClick={() => this.props.toggleSize(this.props.index)} style={{ "cursor":"pointer", "float":"left", "border": "0px solid white", "fontSize":"10px", 'color': color, 'paddingRight': "3px"}}>&nbsp;&nbsp;<span className="expandContractText" style={{"color":color}}>expand ({this.props.nmentions})</span></span>                               

    if(this.props.style.height > window.itemsize){
        button_txt = <span  className="expandcontract" onClick={() => this.props.toggleSize(this.props.index)} style={{"cursor":"pointer", "float":"left", "border": "0px solid white", "fontSize":"10px", 'color': color, 'paddingRight': "3px"}}>&nbsp;&nbsp;<span className="expandContractText" style={{"color":color}}>collapse</span> </span>  
    }

    let button = <span style={{"fontSize": 10, "color": color}}>{button_txt} </span>

    if(this.props.nmentions === 1){
        button = <span style={{"fontSize": 10, "color": color}}><span style={{"fontSize": 10, "color": color}} dangerouslySetInnerHTML={{__html: '&nbsp;'}}></span></span>
    }

    return (
        button
    );
  }
}
