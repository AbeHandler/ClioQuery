/*
FeedPanel.jsx
This one displays actual text
*/

var React = require('react');

import moment from 'moment'
import CountMarker from "./CountMarker.jsx"
import GreySquare from "./GreySquare.jsx"
import Tippy from '@tippyjs/react';
import 'tippy.js/themes/light-border.css';

var classNames = require('classnames');

export default class FeedPanelHLContext extends React.Component{

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.props.collapseButton !== nextProps.collapseButton){
      return true
    }
    if(this.props.is_focal !== nextProps.is_focal){
      return true
    }
    if(this.props.toggleCheckOff !== nextProps.toggleCheckOff){
      return true
    }
    if(this.props.is_expanded !== nextProps.is_expanded){
      return true
    }
    return false
  }



  make_mention_div(html, i){
      return <div key={html + "mention" + i.toString()}
                  style={{"overflow":"hidden", "margin":"auto", "height": "100%", "width":"95%"}} 
                  dangerouslySetInnerHTML={html}></div>
  }



  render() {

    let headline = ""
    let nmentions = ""
    let html = ""
    let pubdate = ""
    let pd = ""
    

    let marker = <span style={{"cursor": "pointer"}}></span>

    try {
        headline = this.props.dt["headline"]
        nmentions = this.props.dt["nmentions"]
        html = this.props.mention
        pubdate = this.props.dt["pubdate"]
        pd = moment(pubdate).format("MMM DD, YY") + " | "
    } catch (error) {
        return(<div ref={this.the_panel} style={this.props.style}></div>)
    }

    let nmentionsf = ""
    try {
      nmentionsf = this.props.dt["nmentionsf"]
    } catch(error){
      //
    }

    //console.log(this.props.dt)

    let f = function getTextWidth(text, font) {
        // re-use canvas object for better performance
        var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
        var context = canvas.getContext("2d");
        context.font = font;
        var metrics = context.measureText(text);
        return metrics.width;
    }

    let pin = <Tippy theme='light-border' delay={600} content={<span>Click to bookmark this story</span>}>
                  <div style={{"border":"0px solid white",
                                "cursor":"pointer", "fontSize":"11px", "float":"left"}} 
                        onMouseUp={(e) => {console.log(headline); this.props.addToGlobals(headline, nmentions)}}><div style={{"fontSize":15, "top": -2, "right": 3, "position":"relative"}}>☆</div></div>  
              </Tippy>


    //note border below is thicker than above to deal w/ different size stars
    let xpin = <Tippy theme='light-border' delay={600} content={<span>Click to unsave this story</span>}>
                <div style={{"border":"0px solid white", "paddingRight": 0, "paddingBottom": 1, 
                              "cursor":"pointer", "cursor":"pointer", "fontSize":"13px", "float":"left"}}
                     onMouseUp={(e) => this.props.remove_global(headline)}><div style={{"color": window.savedcolor, "top": -4,
                                                                                        "right": 3, "position":"relative",
                                                                                        "fontSize":17}}>★</div></div>
               </Tippy>

    let global_pds = []

    for (var value of this.props.globals) {
      if(value["headline"] === headline){
        pin = xpin // i.e. item is in globals
      }
    }

    if(this.props.q === this.props.subcorpus){
        xpin = <span style={{"cursor":"pointer", "fontSize":"11", "float":"left"}} 
                        onMouseUp={(e) => this.props.addToGlobals(headline, nmentions)}><sup>&nbsp;</sup></span>
        pin = <span style={{"cursor":"pointer", "fontSize":"11", "float":"left"}} 
                        onMouseUp={(e) => this.props.addToGlobals(headline, nmentions)}><sup>&nbsp;</sup></span>
    }

    let outr_s_width = 185

    let mid_sw = outr_s_width - 40
    let inner_sw = mid_sw - 40

    let outers = {"width": outr_s_width,
                  "color": "grey", 
                   "height": "100%"}

    let pdborder = ".5px solid #E8E8E8"

    if(moment(pubdate).format("YYYY-MM-DD") === this.props.black_selector_stick_location){
        pdborder = ".5px solid black"
    }

    let sq 


    if(this.props.q === this.props.subcorpus){
      sq = <GreySquare sidePx={12}
                       headline={headline} 
                       all_data_f={this.props.all_data_f}
                       f={this.props.f}
                       q={this.props.q}
                       nmentions={nmentions}/>

    }else{
      sq = <CountMarker sidePx={12}
                      headline={headline} 
                      all_data_f={this.props.all_data_f}
                      f={this.props.f}
                      q={this.props.q}
                      no_tooltip={false}
                      nmentionsf={nmentionsf}
                      nmentions={nmentions}/>

    }

    let pd_div = <div style={{"width":outr_s_width, "border":"0px solid yellow", "height":"100%", "float":"right"}}>
                   <div style={outers}>
                        <div style={{"width": mid_sw, 
                                     "height":"100%",
                                     "float": "right",
                                     borderRadius: '4px',
                                     "border": pdborder}}>
                          <div style={{"width":"95%", 
                                       "margin": "auto",
                                       "height":"100%", "border": "0px solid white"}}> 
                                      <div style={{"width":"20px", 
                                                   "float":"left",
                                                   "paddingLeft": "5px",
                                                   "paddingTop": "4px"
                                                   }}>
                                        {sq}
                                      </div>
                                      <span style={{
                                                    "border": "0px solid white",
                                                    "overflow":"hidden",
                                                    "fontSize": 9.5,
                                                    "height": "90%",
                                                    "paddingBottom": "0px",
                                                    "float":"right"}}>
                                      {pd}
                                      </span>
                          </div>
                        </div>
                   </div>
                 </div>

    let hlcolor = "#1a0dab"
    if(this.props.checked_off.indexOf(headline) >= 0){
        hlcolor = "#7700b3"
    }

    let pin_width = 5 
    let close_button = 20
    let hl_width = f(headline, "12px") 
    let max_width = this.props.secret_lhs_width * .45


    let hlstyle = {"float":"left", "fontSize":"12px", 
                   "border":"0px solid white",
                   "height":"100%", 
                   "cursor":"pointer", "color": "black"}

    if(this.props.show && hl_width > max_width){
        hlstyle["textOverflow"] = "ellipsis"
        hlstyle["width"] = "65%"
        hlstyle["overflow"] = "hidden"
        hlstyle["whiteSpace"] = "nowrap"
    }

    let is_focal = false
    if(moment(this.props.black_selector_stick_location).format("YYYYMMDD") === moment(pubdate).format("YYYYMMDD")){
        is_focal = true
    }

    let is_global = false
    let global_hls = this.props.globals.map(x=> x["headline"])

    if(global_hls.indexOf(headline) >=0){
        is_global = true 
    }

    let is_read = false
    if(this.props.checked_off.indexOf(headline) >= 0){
       is_read = true // is_read
    }

    if(is_focal || is_global){
        hlstyle["color"] = "black"
    }

    let headlines


    let classNameshl = classNames({"is_read_hl": is_read && !this.props.is_hovered && !this.props.is_focal && !is_global,
                                   "is_not_read_hl": !is_read && !this.props.is_focal,
                                   "is_focal_hl": this.props.is_focal,
                                   "headline": true})

    headlines = <div style={hlstyle}>&nbsp;<span className={classNameshl}>{headline}</span></div>

    let unchecked_emoji = <Tippy theme='light-border' delay={200} content={<>"Set to read"</>}>
                              <div style={{"top": -3, "float":"right", "position":"relative"}}><div>☐</div></div>
                        </Tippy>
    let checked_emoji = <Tippy theme='light-border' delay={200} content={<>"Set to unread"</>}>
                                  <div style={{"top": -3, "float":"right", "position":"relative"}} ><div>☒</div></div>
                            </Tippy>
    let emoji

    if(this.props.checked_off.indexOf(headline) === -1){
        emoji = unchecked_emoji
    }else{
        emoji = checked_emoji
    } 

    if(this.props.q === this.props.subcorpus){
       emoji = ""
    }

    if(!(this.props.hover_index === this.props.index)){
       emoji = ""
    }

    let borderColor = "white"

    if(this.props.is_focal){
       borderColor = "black"
    }
    if(this.props.is_hovered && !this.props.is_focal){
       borderColor = window.hover_color
    }

    let top = this.props.is_focal ? -7 : -9

    let className = classNames({"is_not_read_hl": !is_read,
                                "feedpanelhlcontext": true })

    let hldiv = <div data-indexnumber={this.props.index.toString()}
                     data-headline={headline}
                     className={className} style={{"paddingTop":"0px",
                                "width":"100%",
                                "height":"25px",
                               "border": "1px solid " + borderColor,
                               "paddingLeft":"7px"}}>
                  <div style={{"border": "0px solid white", "height":"100%", "width":"100%"}}>
                      {pin}
                      <div style={{"float":"left", "padding": 3, "width": 15}}>
                                {sq} 
                      </div>
                      <span style={{"border": "0px solid white",
                                    "overflow":"hidden",
                                    "fontSize": 9.5,
                                    "height": "90%",
                                    "color": "#696969",
                                    "paddingTop": "1.5px",
                                    "paddingBottom": "0px",
                                    "float":"left"}}>
                                      &nbsp;
                                      {pd}
                                      </span>
                      {headlines}
                      
                      <span onClick={() => this.props.toggleCheckOff(headline)} style={{"cursor":"pointer", "paddingRight": 0, "float":"right"}}></span>

                      {this.props.collapseButton}
                  </div>
                </div>

    return(hldiv)

  }
}