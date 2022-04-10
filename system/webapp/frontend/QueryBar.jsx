/* jshint node: true */
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
import FourColDatePicker from './FourColDatePicker.jsx';

import FindComponent from "./FindComponent.jsx"

import Input from './Input.jsx';

import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import moment from 'moment'

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import 'tippy.js/themes/light-border.css';


import classNames from 'classnames'

export default class QueryBar extends React.Component{

  submitter(){
      this.props.report_qdata(this.state.value)
  }

  cleanup(){
    this.setState({"value_f":""});
    this.props.removeFind("")
  }

  constructor(props) {
      super(props);
      let s = moment(this.props.comprehensive_start).toDate()
      let e = moment(this.props.comprehensive_end).toDate()
      this.state = {value: "", 'value_f': "", "start": s, "end": e}
      this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(e) {
    this.setState({
      value: e.target.value
    });
    this.props.report_q(e.target.value)
  }

  changeHandler_F(e) {
    this.setState({
      value_f: e.target.value
    });

    this.props.set_prelim_f(e.target.value)
    if (e.target.value === ""){
        this.props.removeFind("")
    }
  }

  handleKeyPress_F(event){
    if(event.key === 'Enter' && this.props.find_is_focused){
      console.log("submitting find")
      this.props.setFind(this.state.value_f)
    }
  }

  handleKeyPress(e){
      if (e.which == 13 && !this.props.find_is_focused){ //enter key
        console.log("submitting query")
        this.submitter();
      }
  }

  clearF(){
    this.setState({"value_f": ""})
    this.props.removeFind(this)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.forceQtoBlank !== prevProps.forceQtoBlank) {
      if(this.props.forceQtoBlank){
          this.setState({"value": "", "value_f": ""})
      }
    }

    //this happens if you X out q and F is promoted
    if(this.props.q != prevProps.q && this.props.q !== this.props.subcorpus){
        this.setState({"value": this.props.q})
        if(this.props.f === ""){        
            this.setState({"value_f": ""})
        }
    }

    if (this.props.q !== prevProps.q && this.props.q !== this.props.subcorpus && prevProps.q.length === 0) {
      console.log("hihihihi", this.props.q, prevProps.q)
      this.setState({"value": this.props.q, "value_f": ""})
    }


    if(this.props.f != prevProps.f && this.props.f.length === 0){
        this.setState({"value_f": ""})
    }

    if (this.props.q !== prevProps.q && this.props.f == ""){
        // query has changed, f has been set to zero. Thus set value f = ""
        this.setState({"value_f": ""})
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
    let submitter = this.submitter;

    var v = this.state.value;

    let search_button = <Tippy theme='light-border' delay={600} content={<span>Finds all mentions of a search term within editorials mentioning {this.props.subcorpus}. You can also press Enter to search</span>}>
                           <div style={{"color":"black",
                                        "paddingLeft":0,
                                        "position": "relative",
                                        "left": -5,
                                        "top": 2,
                                        "backgroundColor":window.querybarcolor,
                                        "border":"0px solid white"}} >Query Search </div>
                          </Tippy>


    let sty = {"marginLeft": '5px'}

    let qsty = {"fontWeight":"bold", "color": window.q_color}

    let value = this.state.value
    if(this.props.forceQtoBlank){
        value = ""
    }

    let names = classNames({"q_color": true},
                           {"bold_q": this.props.q !== this.props.subcorpus },
                           {"bold_subcorpus": this.props.q === this.props.subcorpus })

    let x

    if( (this.props.subcorpus === this.props.q) || (this.props.q === "") ){
        x = ""
    }else{
        x = <span onClick={this.props.removeQ}
                  style={{'right': -46, 'top': -27, 'fontWeight': 'bold', 
                          'fontSize': 20,
                          'position':'relative', "zIndex": 5}}><sup>x</sup></span>
    }

    return (
        <div onClick={()=> this.props.turn_off_enter_is_filter()} 
             style={{"width":"100%",
                     "height":window.nav_height,
                     "backgroundColor": window.querybarcolor,
                     "borderBottom": "1px solid grey"}} 
            onKeyPress={(e)=> this.handleKeyPress(e)}>

          {/* , "backgroundColor": window.querybarcolor */}
          <Container style={{"padding":"5px"}}>
            <Row>
             
              <Col sm={2} style={{'border':'0px solid white'}}>{search_button}</Col>
              <Col sm={2} style={{'border':'0px solid black'}}>

                  <InputGroup className='bold_q' 
                              onBlur={() => this.props.turnOffFocus()} 
                              onFocus={() => this.props.turnOnFocus()} 
                              style={{"width":window.query_width}}>
                    <FormControl className={names}
                                 onChange={this.changeHandler}
                                 aria-label="Large"
                                 style={{"height": 29, "position": "relative", "left": -98}}
                                 aria-describedby="inputGroup-sizing-sm"
                                 value={value}/>
                  </InputGroup>
                  {x}
              </Col>
              
              <FourColDatePicker setComprehensiveEnd={this.setComprehensiveEnd.bind(this)}
                                 setComprehensiveStart={this.setComprehensiveStart.bind(this)}
                                 corpus_start={this.props.corpus_start}
                                 corpus_end={this.props.corpus_end}
                                 comprehensive_end={this.props.comprehensive_end}
                                 comprehensive_start={this.props.comprehensive_start}
                                 start={this.state.start}
                                 end={this.state.end}/>

              <FindComponent f={this.props.f}
                             q={this.props.q}
                             changeHandler={this.changeHandler_F.bind(this)}
                             handleKeyPress={this.handleKeyPress_F.bind(this)}
                             value={this.state.value_f}
                             cleanup={this.cleanup.bind(this)}
                             removeFind={this.clearF.bind(this)}
                             setFindIsFocused={this.props.setFindIsFocused.bind(this)}
                             unsetFindIsFocused={this.props.unsetFindIsFocused.bind(this)}
                             setFind={this.props.setFind.bind(this)}/>

            </Row>

          </Container>

        </div>
    )
  }

}
