// @flow
/*
CompStats.jsx
*/

var React = require('react');
var d3 = require('d3');

import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from "react-bootstrap/ToggleButton"
import Button from 'react-bootstrap/Button';
import { Checkbox } from 'antd';

export default function CompStats (props: Props){


    let frac_bookmarked = (props.N_globals/props.N_total) * 100
    let frac_read = (props.N_read/props.N_total)  * 100
    let frac_unread = (props.N_unread/props.N_total)  * 100

    frac_unread = frac_unread + "%"
    frac_read = frac_read + "%"
    frac_bookmarked = frac_bookmarked + "%"


    let bookmarked_button_color = props.read_state.has("bookmarked") ? window.savedcolor : "#b38b88"
    let unread_button_color = props.read_state.has("unread") ? window.unreadcolor : "#969696"
    let read_button_color = props.read_state.has("read") ? window.readcolor : "#f5f5f5"

    return <div style={{"paddingTop": 3, "border":"0px solid blue", "width":"100%", "height": "100%"}}>

                <div style={{"fontSize":8, "backgroundColor":window.unreadcolor, "border":".1px solid black", "height":"35%"}} >
                    <div style={{"width":frac_read, "float": 'left', "backgroundColor":window.readcolor, "border":"0px solid white", "height": "100%"}} >
                    </div>
                    <div style={{"width":frac_unread, "float": 'left', "backgroundColor":window.unreadcolor, "border":"0px solid white", "height": "100%"}} >
                    </div>
                    <div style={{"width":frac_bookmarked, "float": 'right', "backgroundColor":window.savedcolor, "border":"0px solid white", "height": "100%"}} >
                    </div>
                </div>

                <div style={{"fontSize":12, "border":"0px solid green", "width":"100%", "height":"65%"}} >
                    <div style={{"height":18, "paddingTop": 1, 
                                 "textAlign":"left", "float":"left", 
                                 "fontSize":12, "border":"0px solid green",
                                 "width":"23%"}} >
                         <Checkbox className="readCheck"  defaultChecked={true} onChange={() => props.setReadState("read")}> <span style={{"color":"#2E495B"}}>Read: {props.N_read}</span></Checkbox>

                    </div>
                    
                    <div style={{"height":18, "paddingTop": 1, "textAlign":"center", 
                                "float":"left", "fontSize":12, "border":"0px solid green",
                                "width":"43%"}} >
                         <Checkbox className="unreadCheck"  defaultChecked={true} onChange={() => props.setReadState("unread")}> <span style={{"color":"#2E495B"}}>Unread: {props.N_unread}</span></Checkbox>

                    </div>


                    <div style={{"height":18, "paddingTop": 1, "textAlign":"right",
                                "float":"left", "fontSize":12, "border":"0px solid green",
                                "width":"33%"}} >
                         <Checkbox className="bookmarkedCheck" defaultChecked={true} onChange={() => props.setReadState("bookmarked")}><span style={{"color":"#2E495B"}}>Bookmarked: {props.N_globals}</span></Checkbox>

                    </div>

                </div>


            </div>
}

