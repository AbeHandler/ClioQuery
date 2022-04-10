/* jshint node: true */
/* A list of days */
"use strict";
import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Input from './Input.jsx';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import YAxis from "./YAxis.jsx"

import ComprehensiveSearchStats from "./ComprehensiveSearchStats.jsx"
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import PerMentionSlider from "./PerMentionSlider.jsx"
import { saveAs } from 'file-saver';
import Tippy from '@tippyjs/react';
import 'tippy.js/themes/light-border.css';



import moment from 'moment'

import 'antd/dist/antd.css';



export default class FilterBar extends React.Component{

  constructor(props) {
      super(props);

      let s = moment(this.props.comprehensive_start).toDate()
      let e = moment(this.props.comprehensive_end).toDate()
      this.state = {value: "", "start": s, "end": e, "datepicker_mode": false}
      this.changeHandler = this.changeHandler.bind(this);

  }

  setComprehensiveStart(e){
      let m = moment(e, "YYYYMMDD", true)
      if(m.isValid()){
        this.props.setComprehensiveStart(e); 
        this.setState({"start":e}) 
      }else{
        alert("You must enter a valid date")
      }
  }

  setComprehensiveEnd(e){
      let m = moment(e, "YYYYMMDD", true)
      if(m.isValid()){
         this.props.setComprehensiveEnd(e); 
         this.setState({"end":e})
      }else{
        alert("You must enter a valid date")
      }
  }

  changeHandler(e) {
    this.setState({
      value: e.target.value
    });

    this.props.set_prelim_f(e.target.value)
    if (e.target.value === ""){
        this.props.removeFind("")
    }
  }

  getGlobalBit(global_headlines, headline){
    return (global_headlines.indexOf(headline) !== -1).toString()
  }

  getReadBit(read_headlines, headline){
    return (read_headlines.indexOf(headline) !== -1).toString()
  }

  getBlob(){
    let global_headlines = this.props.globals.map((x) => x["headline"])
    let checked_off = this.props.checked_off

    let f = this.props.f.length > 0 ? this.props.f : "none"

    let getnmentionsf = (x) => {
                                if(this.props.f.length > 0){
                                     return x['nmentionsf']   
                                  }else{
                                      return "NA"
                                  }
                                }

    let fheader = this.props.f.length > 0 ? "# mentions " + this.props.f : "NA"
    let b = this.props.filtered_in.map((x) => x["headline"] + "\t" + x["pubdate"] + "\t" + x["nmentions"] + "\t" + this.getGlobalBit(global_headlines, x["headline"]) + "\t" + this.getReadBit(global_headlines, x["headline"]) + "\t" + this.props.q  + "\t" + this.props.subcorpus  + "\t" + f  + "\t" + getnmentionsf(x)  + "\r\n")
    console.log(this.props.q)
    b = ["headline\tpubdate\t# mentions " + this.props.q + "\tsaved\tread\tq\tsubcorpus\tfilter\t" + fheader + "\r\n"].concat(b)
    return(b)
  }

  componentDidUpdate(prevProps, prevState) {
    // Typical usage (don't forget to compare props):
    if (this.props.f !== prevProps.f) {
      if (this.props.f.length === 0){ // f has been cleared
          this.setState({"value": this.props.f})
      }
    }

    if(prevProps.comprehensive_start !== this.props.comprehensive_start){
      this.setState({start: moment(this.props.comprehensive_start).toDate()})
    }

    if(prevProps.comprehensive_end !== this.props.comprehensive_end){
      this.setState({end: moment(this.props.comprehensive_end).toDate()})
    }

  }

  cleanup(){
    this.setState({"value":""});
    this.props.removeFind("")
  }


  render() {

    let legend
    if(this.props.f.length === 0 ){
        legend =  <PerMentionSlider f={this.props.f} 
                                    q={this.props.q}
                                    is_f_legend={false}
                                    filter_threshold_f={this.props.filter_threshold_f}
                                    filter_threshold={this.props.filter_threshold}
                                    reportSlider={this.props.reportSlider}
                                    subcorpus={this.props.subcorpus}/>
    }else{
        legend = <PerMentionSlider f={this.props.f} 
                                   q={this.props.q}
                                   is_f_legend={true}
                                   all_data_f={this.props.all_data_f}
                                   filter_threshold_f={this.props.filter_threshold_f}
                                   filter_threshold={this.props.filter_threshold}
                                   reportSlider={this.props.reportSliderf}
                                   subcorpus={this.props.subcorpus}/>
    }


    if(this.props.loading){
        return(<div style={{"width":"100%", "height": this.props.height}}></div>)
    }

    let inner = <>Find articles mentioning {this.props.q} that also mention some other word</>

    let pinned_or_undo = ""

    if(this.props.feedmode !== "global"){
      pinned_or_undo = <div >
                          <Button onClick={() => {
                                                    if(this.props.globals.length > 0){
                                                          this.props.setGlobalFeed()
                                                    }else{
                                                          alert("You have not saved any articles. Click the star next to a headline to save an article.")
                                                    }
                                                 }
                                          }
                                  style={{"paddingTop":"3px",
                                          "paddingRight":"4px",
                                          "marginTop": "3px",
                                          "paddingLeft":"4px"}}
                                  variant="outline-dark" size="sm">★ Saved ({this.props.globals.length}) </Button>
                       </div>
    }else{
      pinned_or_undo = <div style={{"height": "100%"}}>
                          <Button variant="outline-dark" size="sm" onClick={this.props.unsetGlobalFeed} className="headline">{" Back "}</Button>
                       </div>
    }

    if (this.props.numQ === 0){
      return(<div style={{"width":"100%", "height": this.props.height}}></div>)
    }

    let value = this.state.value

    let filter_query_field = ""

    let Nfiltered_in = this.props.filtered_in.filter((x) => this.props.checked_off.indexOf(x["headline"]) === -1).length

    let Nchecked_off = this.props.filtered_in.filter((x) => this.props.checked_off.indexOf(x["headline"]) !== -1).length

    Nfiltered_in = Nfiltered_in.toString()
    Nchecked_off = Nchecked_off.toString()
    let total = this.props.filtered_in.length.toString()

    let checked_off = '☒' + Nchecked_off

    if(this.props.checked_off.length === 0){
      checked_off = ""
    }

    let start_str = moment(this.props.comprehensive_start).format("MM/DD/YY")
    let end_str = moment(this.props.comprehensive_end).format("MM/DD/YY")

    let comprehensiveness_stats_banner = ' Unread (' + Nfiltered_in.toString() + ') '

    let unread_ = ' Unread (' + this.props.N_unread.toString() + ')'
    let comprehensiveness_stats_bottom = 'All (' + (this.props.N_unread + this.props.N_read).toString() + ') '
    let read = 'Read (' + (this.props.N_read).toString() + ') ' 

    let comprehensiveness_stats = <ComprehensiveSearchStats unread_={unread_}
                                             read={read}
                                             read_state={this.props.read_state}
                                             N_read={this.props.N_read}
                                             N_unread={this.props.N_unread}
                                             N_total={this.props.N_unread + this.props.N_read + this.props.globals.length}
                                             N_globals={this.props.globals.length}
                                             comprehensiveness_stats_bottom={comprehensiveness_stats_bottom}
                                             globals={this.props.globals}
                                             setGlobalFeed = {this.props.setGlobalFeed.bind(this)}
                                             setReadState={this.props.setReadState} />

    let export_button = <Button style={{"paddingTop":"3px", "position":"relative", "right": -35}}
                                            onClick={() => {
                                              var blob = new Blob(this.getBlob(), {type: "text/plain;charset=utf-8"});
                                              saveAs(blob, "report.tsv")
                                            }}
                                            variant="outline-dark" size="sm">Export</Button>

    export_button = ""

    if (this.props.q === this.props.subcorpus){
      comprehensiveness_stats = ""
      pinned_or_undo = ""
      export_button = ""
      filter_query_field = ''
      legend = ""
    }

    let legend_columns = <Col style={{"width":"100%", "height": this.props.height, 
                                        "border":"0px solid lightgrey", "paddingLeft": 0}} sm={4}>
                                {legend}
                            </Col>

    let filler_columns = <Col sm={3}></Col>
                      
    let comprehensiveness_coluns = <Col style={{"border":"0px solid red", "width":"100%", "height": "100%"}}
                                        sm={5}>
                                        {comprehensiveness_stats}
                                   </Col>

    let non_datepicker_mode_markup = <>

                                      {legend_columns}
                                      {filler_columns}
                                      {comprehensiveness_coluns}

                                      </>



    return (
        <div onClick={()=> this.props.turn_on_enter_is_filter()}
             style={{"width":"100%", "height": this.props.height}}>
              <Container style={{"borderTop":"1px solid grey", "width":"100%", "height": "100%"}}>
                <Row style={{"width":"100%", "height": "100%"}}>
                  {non_datepicker_mode_markup}
                </Row>
              </Container>
        </div>
    )
  }

}
