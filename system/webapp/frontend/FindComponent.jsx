/* 3-column find component */

"use strict";
import React from 'react';

var $ = require('jquery');

import Col from 'react-bootstrap/Col';

import classNames from 'classnames'
import moment from 'moment'
import DatePicker from "react-datepicker";
import Input from './Input.jsx';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Tippy from '@tippyjs/react';
import 'tippy.js/themes/light-border.css';
import Button from 'react-bootstrap/Button';
import "react-datepicker/dist/react-datepicker.css";

export default class FindComponent extends React.Component{

  clearF(){
    console.log("ok2")
    this.props.removeFind()
  }

  render() {
    let inner = <>Find articles mentioning {this.props.q} that also mention some other word</>
    let button_or_x = <Tippy theme='light-border' delay={600} content={inner}>
                                    <div id="huh"> <div style={{"textAlign": "right", "paddingRight": 0, 
                                                                "color":"black", "backgroundColor":window.querybarcolor,
                                                                "position":"relative",
                                                                "left": 25,
                                                                "top": 2,
                                                                "border":"0px solid white"}}
                                                                onClick={() => this.props.setFind(this.props.value)}>Filter by subquery</div></div>
                                  </Tippy>


    let qsty = {"height": 29} // weirdly wont accept color blue
    let x = <span onClick={this.clearF.bind(this)} 
                  style={{'right': -160, 'top': 2, 'fontWeight': 'bold', 'fontSize': 20,
                          'position':'relative', "zIndex": 5}}><sup>x</sup></span>
    
    if(this.props.f === ""){
        x = ""
    }


    let find_group = <InputGroup onBlur={() => this.props.unsetFindIsFocused()} 
                                        onFocus={() => this.props.setFindIsFocused()}
                                        style={{"height":"100%", "float":"right", "width":window.query_width}}>
                              
                              <FormControl style={qsty}
                                           onChange={this.props.changeHandler}
                                           aria-label="Large"
                                           className="bold_f"
                                           aria-describedby="inputGroup"
                                           onKeyPress={this.props.handleKeyPress.bind(this)}
                                           value={this.props.value}/>
                      </InputGroup>

    return(<> 
              <Col style={{"border": "0px solid blue", "paddingRight": 5, "width":"100%", "height": "100%"}} sm={2}>
                    {button_or_x}
              </Col> 
              <Col style={{"border": "0px solid green", "width":"100%", "paddingRight": 3}} sm={2}>
                    {find_group}
                    {x}
              </Col>
          </>)

  }

}
