/* jshint node: true */
/* A list of days */
"use strict";
import React from 'react';

var $ = require('jquery');

import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import CorpusSelector from "./CorpusSelector.jsx"

import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import Input from './Input.jsx';

import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import moment from 'moment'

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import 'tippy.js/themes/light-border.css';

import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";


import classNames from 'classnames'

export default class QueryBar extends React.Component{

  submitter(){
      this.props.report_qdata(this.state.value)
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
    let b = this.props.filtered_in.map((x) => x["headline"] + "\t" + moment(x["pubdate"]).format("YYYY-MM-DD") + "\t" + x["nmentions"] + "\t" + this.getGlobalBit(global_headlines, x["headline"]) + "\t" + this.getReadBit(global_headlines, x["headline"]) + "\t" + this.props.q  + "\t" + this.props.subcorpus  + "\t" + f  + "\t" + getnmentionsf(x)  + "\r\n")

    b = ["headline\tpubdate\t# mentions " + this.props.q + "\tsaved\tread\tq\tsubcorpus\tfilter\t" + fheader + "\r\n"].concat(b)
    return(b)
  }


  constructor(props) {
      super(props);
      let s = moment(this.props.comprehensive_start).toDate()
      let e = moment(this.props.comprehensive_end).toDate()
      this.state = {value: "", "start": s, "end": e}
      this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(e) {
    this.setState({
      value: e.target.value
    });
    this.props.report_q(e.target.value)
  }

  handleKeyPress(e){
      if (e.which == 13){ //enter key
        this.submitter();
      }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.forceQtoBlank !== prevProps.forceQtoBlank) {
      if(this.props.forceQtoBlank){
          this.setState({"value": ""})
      }
    }

    //this happens if you X out q and F is promoted
    if (this.props.q !== prevProps.q && this.props.q !== this.props.subcorpus && prevProps.q.length === 0) {
      this.setState({"value": this.props.q})
    }

    if(prevProps.comprehensive_start !== this.props.comprehensive_start){
      this.setState({start: moment(this.props.comprehensive_start).toDate()})
    }

    if(prevProps.comprehensive_end !== this.props.comprehensive_end){
      this.setState({end: moment(this.props.comprehensive_end).toDate()})
    }

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


  render() {

    return (
        <div style={{"width":"100%", 
                     "backgroundColor": "#2E495B",
                     "fontSize": 20,
                     "height":window.nav_height}} 
              onKeyPress={(e)=> this.handleKeyPress(e)}>

          <Container style={{"padding":"5px"}}>
            <Row>
              <Col sm={2} style={{'top': -6, 'fontWeight':'bold', 
                                  'fontSize': 26, 'position': 'relative', "left": -4,
                                  'color':'white'}}>
                  {"ClioQuery"}
              </Col>
              <Col sm={2} onClick={() => alert("this is not implemented")} 
                          style={{'position': 'relative', "left": -20, 'fontSize': 16, 'paddingTop':4, 'color':'white', "cursor": "pointer"}}>{"User Guide"}</Col>
              <Col sm={2} onClick={() => this.props.show_contact()}
                          style={{'position': 'relative', "left": -70, 'fontSize': 16, 'paddingTop':4, 'color':'white', "cursor": "pointer"}}>{"About"}</Col>
              <Col sm={5} style={{'color':'white'}}>
                  <CorpusSelector setSubcorpus={this.props.setSubcorpus.bind(this)}/>
              </Col>
              <Col sm={1}>
                          <Button 
                              onClick={() => {
                                var blob = new Blob(this.getBlob(), {type: "text/plain;charset=utf-8"});
                                saveAs(blob, "report.tsv")
                              }}
                              style={{"top":-4, "position":"relative",
                                      'border': '1px solid white',
                                      "backgroundColor": "#2E495B",
                                      "height":"30px",
                                      'color': 'white'}}>
                                      <span style={{'position':'relative', 'top':-4, 'color':'white'}}>Export</span>
                          </Button>
              </Col>

            </Row>

          </Container>

        </div>
    )
  }

}
