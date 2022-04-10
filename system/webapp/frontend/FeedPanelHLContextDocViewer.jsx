/*
FeedPanel.jsx
This one displays actual text
*/

var React = require('react');

import moment from 'moment'

import CountMarker from "./CountMarker.jsx"
import GreySquare from "./GreySquare.jsx"
import { connect } from "react-redux";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import 'tippy.js/themes/light-border.css';
import classNames from 'classnames'

export default class FeedPanelHLContextDocViewer extends React.Component{

  constructor(props) {
    super(props);
  }


  clickHL(headline, pubdate, ix){
    if(this.props.feedmode === "global"){
        let q = this.props.globals[this.props.index]["q"]
        this.props.set_scroll(ix)
                 //handleClickOnDocHeader(headline, pubdate, ix, q)
        this.props.handleClickOnDocHeader(headline, pubdate, ix, q)
    }else{
        this.props.set_scroll(ix)
                 //handleClickOnDocHeader(headline, pubdate, ix, q)
        this.props.handleClickOnDocHeader(headline, pubdate, ix, this.props.q)
    }
    
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

    
    //from below => onMouseDown={(e) => this.clickHL(headline, pubdate, this.props.index)}> 
    let marker = <span style={{"cursor": "pointer"}}></span>

    try { // this is info on the *main* focal doc. The doc viewer can be out of sync with this
        headline = this.props.dt["headline"]
        nmentions = this.props.dt["nmentions"]
        html = this.props.mention
        pubdate = this.props.dt["pubdate"]
        pd = moment(pubdate).format("MMMM DD, YYYY")
    } catch (error) {
        console.log("[*] warning exiting render in FeedPanelHLContextJustPresentation early")
        return(<div ref={this.the_panel} style={this.props.style}></div>)
    }

    let f = function getTextWidth(text, font) {
        // re-use canvas object for better performance
        var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
        var context = canvas.getContext("2d");
        context.font = font;
        var metrics = context.measureText(text);
        return metrics.width;
    }
   

    let pin = <Tippy theme='light-border' delay={600} content={<span>Click to save this story</span>}>
                  <span style={{"border":"0px solid white", "cursor":"pointer", "fontSize":"11", "float":"left", "height": 22, "width": 15}} 
                        onClick={(e) =>  this.props.addToGlobals(headline, nmentions)}><div style={{"fontSize":15, "top": -1, "right": 3, "position":"relative"}}>☆</div></span>  
              </Tippy>


    //note border below is thicker than above to deal w/ different size stars
    let xpin = <Tippy theme='light-border' delay={600} content={<span>Click to unsave this story</span>}>
                <span style={{"border":"0px solid white", "paddingRight": .4, "cursor":"pointer", "fontSize":"13", "float":"left", "height": 22, "width": 15}}
                     onClick={(e) => this.props.remove_global(headline) }><div style={{"fontSize":17, "top": -3, "right": 3, "position":"relative", "color": window.savedcolor}}>★</div></span>
               </Tippy>

    let global_pds = []


    for (var value of this.props.globals) {
      if(value["headline"] === this.props.doc_hl){
        pin = xpin // i.e. item is in globals
      }
    }

    if(this.props.q === this.props.subcorpus){
        xpin = <span style={{"border":"0px solid white", "cursor":"pointer", "fontSize":"11", "float":"left"}} 
                        onMouseUp={(e) => this.props.addToGlobals(headline, nmentions)}><sup>&nbsp;</sup></span>
        pin = <span style={{"border":"0px solid white", "paddingRight": 1.1, "cursor":"pointer", "fontSize":"11", "float":"left"}} 
                        onMouseUp={(e) => this.props.addToGlobals(headline, nmentions)}><sup>&nbsp;</sup></span>
    }

    let outr_s_width = 185

    let mid_sw = outr_s_width - 40
    let inner_sw = mid_sw - 40

    let outers = {"width": outr_s_width, 
                   "height": "95%"}

    let pdborder = ".5px solid #E8E8E8"

    if(moment(pubdate).format("YYYY-MM-DD") === this.props.black_selector_stick_location){
        pdborder = ".5px solid black"
    }

    let sq 

    //console.log("3", this.props.doc_nmentionsf)

    if(this.props.q === this.props.subcorpus){
      sq = <GreySquare sidePx={12}
                       headline={headline} 
                       all_data_f={this.props.all_data_f}
                       f={this.props.f}
                       nmentions={this.props.doc_nmentions}/>
    }else{
      sq = <CountMarker sidePx={12}
                      headline={headline} 
                      all_data_f={this.props.all_data_f}
                      f={this.props.f}
                      no_tooltip={false}
                      q={this.props.q}
                      nmentions={this.props.doc_nmentions}
                      nmentionsf={this.props.doc_nmentionsf}/>
    }

    let pd_div = <div style={{"width":outr_s_width, "border":"0px solid yellow", "height":"100%", "float":"right"}}>
                   <div style={outers}>
                        <div style={{"width": mid_sw, 
                                     "height":"100%",
                                     "float": "right",
                                     borderRadius: '4px'}}>
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
                                                    "color": "rgb(80,80,80)",
                                                    "paddingBottom": "0px",
                                                    "float":"right"}}>
                                      {pd}
                                      </span>
                          </div>
                        </div>
                   </div>
                 </div>

    let hlcolor = "#1a0dab"

    let is_read = this.props.checked_off.indexOf(headline) >= 0

    if(is_read){
        hlcolor = "#7700b3"
    }

    let pin_width = 5 
    let close_button = 20
    let hl_width = f(headline, "12px") 
    let max_width = this.props.secret_lhs_width * .45


    let hlstyle = {"float":"left", "fontSize":"12px", 
                   "border":"0px solid white",
                   "height":"100%", 
                   "color": "black"}


    if(this.props.show && hl_width > max_width){
        hlstyle["textOverflow"] = "ellipsis"
        hlstyle["width"] = max_width
        hlstyle["overflow"] = "hidden"
        hlstyle["whiteSpace"] = "nowrap"
    }

    let headlines = <div style={hlstyle}>&nbsp;<span>{this.props.doc_hl}</span></div>

    let show_selected_color = !((this.props.hover_index !== this.props.doc_ix) && (this.props.black_selector_stick_location === -1))

    if(this.props.black_selector_stick_location === -1 || (this.props.hover_index !== this.props.doc_ix)){
        show_selected_color = false
    }

    let names = classNames({"doc_viewer": true,
                            "is_read_dv": show_selected_color,
                            "is_focal_dv": show_selected_color})


    let pdcolor = moment(this.props.doc_pubdate).format("YYYYMMDD") === moment(pubdate).format("YYYYMMDD") ? "grey" : "lightgrey"

    let bordercolor = this.props.doc_pubdate === pubdate? "black" : "lightgrey"

    let top = -7


    let is_read_earmark = <span style={{'padding':0, 
                                        'fontSize':20,
                                        "top": top,
                                        "position": "relative",
                                        "color": "#383838",
                                        "float": "right"}}>&#9701;</span>

    is_read_earmark = ""

    let hldiv = <div id="hlHello"
                      className={names}
                      style={{"paddingTop":"0px",
                             "width":"100%",
                             "display":"inline-block", // scale to content size
                             "borderBottom": ".1px solid lightgrey",
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
                                      {moment(this.props.doc_pubdate).format("MMM DD, YY")}
                                      </span>
                      {headlines}
                       <span onClick={() => this.props.toggleCheckOff(this.props.doc_hl)} style={{"float":"right", "cursor":"pointer"}}>{is_read_earmark}</span>
                  </div>
                </div>


    return(hldiv)

  }
}
