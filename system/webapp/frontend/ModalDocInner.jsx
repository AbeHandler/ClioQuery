// @flow
/*
ModalDocInner.jsx
*/

var React = require('react');
import moment from 'moment'
import Button from 'react-bootstrap/Button';

import $ from 'jquery';

import { VariableSizeList as List, areEqual } from 'react-window';
import FeedPanelHLContextDocViewer from "./FeedPanelHLContextDocViewer.jsx"
import HoverSpan from "./HoverSpan.jsx"

export default class ModalDocInner extends React.Component{

    rowMap2(props, index){

        let className1 = ""

        if(this.props.black_selector_stick_location === -1){
            className1 = "nocolor"
        }

        let current_headline = ""

        try{
            current_headline = this.props.dt.headline
        }catch(e){

        }

        if(current_headline !== this.props.doc_hl){
            className1 = "nocolor nosync "
        }

        let grafnos = Object.keys(this.props.graf_sizes)
        let last_graf_no = grafnos[grafnos.length -1]

        let is_last = last_graf_no.toString() === index.toString()

        let marginBottom = is_last ? 50 : 10

        // dangerouslySetInnerHTML={{__html: e}}
        let splits = props.split.map(e => <HoverSpan key={e} html={e}/>)

        className1 = className1 + "docviewer_grafno"

        if(this.props.black_selector_stick_location === -1){
            className1 = className1 + " " + "nohl"
        }

        return (<div key={index.toString() + "j"} 
                     style={{"width": "100%"}} 
                     data-graf-no={index.toString()} className={className1}>
                     <div  style={{"marginBottom": marginBottom, 
                                  "width": "93%",
                                  "marginLeft": "auto",
                                  "marginRight": "auto",
                                  "fontSize": 12,
                                  "color": "black",
                                  'display': 'block',
                                  'border': '1px solid bottom',
                                  'overflow': 'auto'}}>
                        <div style={{'position':'relative'}}>
                            {splits}
                        </div>
                     </div>
                </div>)

    }

    constructor(props) {
      super(props);
      this.listRef = React.createRef();
    }

    componentDidMount(){
        $("#new_list").scrollTop(0)
    }

    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):

      if (this.props.doc_hl !== prevProps.doc_hl) {
          $("#new_list").scrollTop(0)
      }

      if (this.props.mention_graph_index !== prevProps.mention_graph_index) {

          let scroll_d = 0

          $( "div[data-graf-no]" ).each(function(i,j){
              if($(j).attr("data-graf-no") < this.props.mention_graph_index){
                  scroll_d += $(j).height()
              }
          }.bind(this));

          $("#new_list").scrollTop( scroll_d )
      }

    }

    render(){

        let html = {__html: this.props.story}

        let pin = <span style={{"cursor":"pointer", "float": "left"}} onClick={(e) => this.props.addToGlobals(this.props.headline, this.props.panelNo)}>☆</span>  

        let xpin = <span style={{"color": window.savedcolor, "cursor":"pointer", "float": "left"}} onClick={(e) => this.props.remove_global(this.props.headline)}>★</span>

        let global_pds = []

        let tooltip = "Click to save this story"

        for (var value of this.props.globals) {
          if(value["headline"] === this.props.headline){
            pin = xpin // i.e. item is in globals
            tooltip = "Click to unsave this story"
          }
        }

        let top_height = 25
        let borders = 6

        let newlist = <div
                        id={"new_list"}
                        height={this.props.container_height - top_height - borders}
                        style={{"height":  this.props.container_height - top_height - borders,
                                "width":"100%",
                                "overflowY": "auto"}}
                        ref={this.listRef}
                      >
                        {this.props.grafs.map(this.rowMap2.bind(this))}
                      </div>


        let hldiv2 = <FeedPanelHLContextDocViewer
                                 addToGlobals={this.props.addToGlobals}
                                 all_data_f={this.props.all_data_f}
                                 black_selector_stick_location={this.props.black_selector_stick_location}
                                 checked_off={this.props.checked_off}
                                 collapseButton={""}
                                 doc_hl={this.props.doc_hl}
                                 doc_nmentions={this.props.doc_nmentions}
                                 doc_nmentionsf={this.props.doc_nmentionsf}
                                 doc_pubdate={this.props.doc_pubdate}
                                 doc_ix={this.props.doc_ix}
                                 dt={this.props.dt}
                                 f={this.props.f}
                                 feedmode={this.props.feedmode}
                                 globals={this.props.globals}
                                 handleClickOnDocHeader={this.props.handleClickOnDocHeader}
                                 hover_index={this.props.hover_index}
                                 q={this.props.q}
                                 toggleCheckOff={this.props.toggleCheckOff}
                                 remove_global={this.props.remove_global}
                                 secret_lhs_width={this.props.secret_lhs_width}
                                 set_scroll={this.props.set_scroll}
                                 show={this.props.show}
                                 subcorpus={this.props.subcorpus}
                                 />


        return(<div 
                    style={{"border": "0px solid blue", 
                            "height":this.props.container_height}}>
                  
                  <div style={{"height":window.labelheight,
                              "backgroundColor": window.querybarcolor,
                              "border": "1px solid black",
                              "fontWeight":"bold",
                              "paddingLeft": 7,
                              "paddingTop": 2,
                              'left': 0}}>Document Viewer</div>
                  {hldiv2}
                  <div style={{"width":"100%"}}>
                    {newlist}
                  </div> 
               </div>)
    }
}
