var React = require('react');

import moment from 'moment'

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import 'tippy.js/themes/light-border.css';
import classNames from 'classnames'

export default class RugPoint extends React.Component{

    constructor(props) {
        super(props);
        this.state = {'mouse_inside': false}
    }

    handle_mouse_inside(){
      this.props.set_callout_clickable()
      this.props.set_current_rug(this.props.index)
    }

    handle_mouse_outside(){
      this.props.unset_callout_clickable()
      this.props.set_current_rug(-1)
    }

    get_color(){

      let color = ""

      if(this.props.is_read){
          color = window.readcolor
      }else{
          color = window.unreadcolor
      }

      if(this.props.is_saved){
          color = window.savedcolor
      }

      if(this.props.is_hovered){
          color = "#81BDFF" // light grey
      }

      if(this.props.is_focal){
          color = "#f0cd11" // gold
      }

      return color

    }

    render(){

        let cursor
        let height = "10px"

        let color = this.get_color()

        if(this.state.mouse_inside){
          cursor = "pointer"
        }else{
          cursor = 'auto'
        }

        let ou

        let names = classNames({"isRugPoint": !this.state.mouse_inside })

        let border = '0x solid blue'

        if(color === "#D3D3D3"){
             border = '3x solid #81BDFF'
        }

        if(this.state.mouse_inside || this.props.current_rug){
            ou =   <div style={{"width":"1.5px",
                              "height":height,
                              "cursor":cursor,
                              "marginLeft": this.props.left_offset,
                              "backgroundColor": color,
                              "float":"left",
                              "border": border,
                              "overflow":"hidden"}}
                      key={this.props.x + "fo3d_g"}>
                    </div>

        }else{
            ou = <div key={this.props.x + "fod_g"}
                      className={names}
                      style={{"width":"2px",
                            "height":height,
                            "cursor":cursor,
                            "marginLeft": this.props.left_offset,
                            "float":"left",
                            "border": border,
                            "backgroundColor": color,
                            "paddingLeft":"2px",
                            "overflow":"hidden"}}
                    >
            </div>
        }


        let rug_div = <div
                           onMouseLeave={()=> this.handle_mouse_outside()}
                           onMouseMove={()=> this.handle_mouse_inside()}
                           onMouseEnter={()=> this.handle_mouse_inside()}
                           onMouseUp={() => this.props.report_click_on_callout({"headline": this.props.headline, "pubdate": this.props.pubdate})}
                           style={{"marginTop":"0px", 
                                    "width":"100%",
                                    "cursor": "pointer",
                                    "height": "100%"}}
                           key={this.props.i + "fo_gsw2g"} xmlns="http://www.w3.org/1999/xhtml" >
                      {ou}
                      </div>

        var is_checked_off_indicator = <span>{this.props.is_checked_off ? '☒' : ""}</span>

        if(this.state.mouse_inside || this.props.current_rug){
             rug_div = <Tippy current_rug={this.props.current_rug} theme='light-border' delay={0} content={<span> <span style={{"color":"black"}}>{this.props.headline}</span>{is_checked_off_indicator}<br/> <span style={{"color":"grey"}}>{moment(this.props.pubdate).format("MMM DD,YYYY")}</span></span>}>{rug_div}</Tippy> 
        }


        return(<foreignObject 
                x={this.props.x - this.props.left_offset}
                y={this.props.y}
                key={this.props.i + "fo_g"}
                width={"10px"}
                data-pd={this.props.pubdate}
                onMouseUp={() => this.props.report_click_on_callout({"headline": this.props.headline, "pubdate": this.props.pubdate})}            
                height={50}>
                  {rug_div}
                </foreignObject>)

    }
}
