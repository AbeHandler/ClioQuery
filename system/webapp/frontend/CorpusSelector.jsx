/* 3-column find component */

"use strict";
import React from 'react';

var $ = require('jquery');

import Col from 'react-bootstrap/Col';

import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import classNames from 'classnames'
import moment from 'moment'
import DatePicker from "react-datepicker";
import Input from './Input.jsx';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Tippy from '@tippyjs/react';
import 'tippy.js/themes/light-border.css';
import "react-datepicker/dist/react-datepicker.css";

export default class CorpusSelector extends React.Component{

  render() {

    return(<div>
                    <div style={{"float":"right"}}>
                        <Dropdown
                          style={{"position":"relative", "top": -3}}
                          variant="outline-secondary"
                          id="input-group-dropdown-2" 
                          defaultValue="drugs"
                          as={ButtonGroup}>
                          <Dropdown.Toggle split style={{"backgroundColor": "#2E495B", 
                                                          "height":"30px",
                                                          "border":"1px solid white"}} id="dropdown-custom-2">
                              <Tippy theme='light-border' delay={600} content={<span>Use this to change the corpus</span>}>
                                <span style={{"top":-4, "position":"relative", 'color':"white"}} >Corpus&nbsp;</span>
                              </Tippy>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                          <Dropdown.Item onClick={() => this.props.setSubcorpus("drugs")} href="#">Drugs</Dropdown.Item>
                          <Dropdown.Item onClick={() => this.props.setSubcorpus("astronaut")} href="#">Astronaut</Dropdown.Item>
                          <Dropdown.Item onClick={() => this.props.setSubcorpus("combat")} href="#">Combat</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                    </div>
                  </div>)

  }

}
