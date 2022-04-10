/* jshint node: true */
"use strict";
import React from 'react';

var $ = require('jquery');

import Col from 'react-bootstrap/Col';

import classNames from 'classnames'
import moment from 'moment'
import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";

export default class FourColDatePicker extends React.Component{

  render() {

    let datepicker_start = <div style={{"border": "0px solid green", "padding": 0}} className="customDatePickerWidth"> 
                                <DatePicker showMonthDropdown showYearDropdown 
                                            openToDate={this.props.start}
                                            popperPlacement="bottom"
                                            dropdownMode="select"
                                            minDate={moment(this.props.corpus_start).toDate()}
                                            maxDate={moment(this.props.end).toDate()} 
                                            selected={this.props.start} 
                                            onChange={(e) => this.props.setComprehensiveStart(e)} />
                           </div> 

    let datepicker_end = <div style={{"border": "0px solid yellow", "padding": 0}}>
                                <DatePicker showMonthDropdown showYearDropdown 
                                            dropdownMode="select"
                                            popperPlacement="bottom" minDate={this.props.start}
                                            maxDate={moment(this.props.corpus_end).toDate()}
                                            openToDate={this.props.end}
                                            selected={this.props.end} 
                                            onChange={(e) => this.props.setComprehensiveEnd(e)} />
                         </div> 

    var offset = -71                   
    return(<>

                <Col style={{"position": "relative", "left": offset, "textAlign":"right", 'border': '0px solid red'}} sm={1}>
                <span>{"Start date"} </span>
                </Col>
                <Col sm={1} style={{"position": "relative", "left": offset, 'border': '0px solid blue', "color":"black", 'paddingLeft': 0, 'paddingRight':0, 'textAlign':'center'}} >
                    {datepicker_start}
                </Col>
                <Col  style={{"position": "relative", "left": offset, 'border': '0px solid blue', "textAlign":"right"}} sm={1}>
                 <span>{"End date"}</span>
                </Col>
                <Col sm={1} style={{"position": "relative", "left": offset, 'padding': 0, "color":"black", 'border': '0px solid green', 'paddingRight':0, 'textAlign':'center'}} >
                    {datepicker_end}
                </Col>
            </>)
  }

}
