// @flow

'use strict';
/*
 x-axis.jsx
*/

var React = require('react');
var d3 = require('d3');
import moment from 'moment'
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import CountToolTipTargetXaxis from "./CountToolTipTargetXaxis.jsx"
import RugPoint from "./RugPoint.jsx"
import RugPoints from "./RugPoints.jsx"
import GlobalRugs from "./GlobalRugsNewStyle.jsx"

import classNames from 'classnames'

type Props = {
  foo: number,
  height: number,
  width: number,
  lateralize:<T>(T, T) => number,
  lateral_scale:<T>(T) => T,
  black_selector_stick_location: string,
};

type State = {
  chart_div_l: number,
};

export default class XAxis extends React.Component<Props, State>{

  constructor(props: Props) {
    super(props);
    this.state = {"chart_div_l": 0};
  }

  render() {
    let lateralize = this.props.lateralize;
    let lateral_scale = this.props.lateral_scale;

    let ticks = lateral_scale.ticks(d3.timeYear);

    let format = lateral_scale.tickFormat();
    let x_label_height = (this.props.width/2) - 75;
    let y_label_height = this.props.height * .95;

    let y_loc = 26

    let hl = "d" //this.props.scrolled.headline
    let pd = ""

    try{
        hl = this.props.scrolled.headline
    }catch(e){

    }

    try{
        pd = this.props.scrolled.pubdate
    }catch(e){

    }

    let global_rugs = ""


    let hover_date_line = ""
    let hovered_color = "black"

    if(this.props.hovered_pd !== ""){
      hover_date_line = <line key={"between_date_and_axis"}
                            x1={lateralize(moment(this.props.hovered_pd).toDate(), lateral_scale) + 1}
                            y1="14"
                            x2={lateralize(moment(this.props.hovered_pd).toDate(), lateral_scale) + 1}
                            y2="24"
                            stroke={hovered_color}
                            strokeWidth="1.5px"/>
    }

    let focal_date_line = ""

    let make_small_tick_line = function(object, i){
      return(<line key={i + '_lll'} 
                   x1={lateralize(object, lateral_scale)}
                   x2={lateralize(object, lateral_scale)}
                   y1="14" y2="17" stroke="black" strokeWidth="2"/>)
    }

    let width = 86

    let make_text = function(object, i, q, input_datas, color){
      
      //hide the last tick mark
      if(i === input_datas.length){
        return <text className="dateXaxis"  fontSize=".7em" key={i + '_k'} x={lateralize(object, lateral_scale) - 12} y="34" fill="black">{""}</text>
      }
      return(<text className="dateXaxis"  fontSize=".7em" key={i + '_k'} x={lateralize(object, lateral_scale) - 12} y="34" fill="black">{format(object)}</text>)

    }

    let make_tick = function make(object, i, q, input_datas, color){
                        if (i === 0){
                          return <g key={i + "gjg"}> {make_small_tick_line(object, i)}{make_text(object, i, q, input_datas, color)}</g>
                        }else{
                          return <g key={i + "gjg"}> {make_small_tick_line(object, i)}{make_text(object, i, q, input_datas, color)}</g>
                        }
                    }

    let make_big_tick = function (object, i: string){
        return <text fontSize="1em"
                     key={i + '_kfe4'}
                     x={lateralize(dt, lateral_scale) - offset + 3.5} 
                     y="25"
                     fill="black">{full_date}</text>
    }

    let make_background = function (object, offset, tooltip){
        return <Tippy theme='light-border' delay={0} content={tooltip}>
                  <rect x={lateralize(dt, lateral_scale) - (width/2)}
                       width={width}
                       height="20"
                       y={y_loc}
                       id="background"
                       stroke="black"
                       strokeWidth="1.1"
                       fillOpacity="0.95" 
                       fill="#ffffed" />
              </Tippy>
    }

    //console.log(this.props.hover_index)

    let rug_plots
    //too many
    if (this.props.q === this.props.subcorpus){
      rug_plots = ""
    }else{
      rug_plots = <RugPoints 
                     all_data = {this.props.all_data}
                     all_data_f = {this.props.all_data_f}
                     black_selector_stick_location={moment(this.props.black_selector_stick_location).format("YYYYMMDD")}
                     chart_height = {this.props.chart_height} 
                     checked_off = {this.props.checked_off}
                     doc_hl={this.props.doc_hl}
                     f = {this.props.f}
                     f_data = {this.props.f_data}
                     feedmode = {this.props.feedmode}
                     globals = {this.props.globals}
                     x_scale = {this.props.x_scale}
                     hover_headline = {this.props.hover_headline}
                     hover_index = {this.props.hover_index}
                     report_click_on_callout = {(e) => this.props.report_click_on_callout(e)}
                     set_callout_clickable = {() => this.setState({'turn_off_normal_mouse_up_down': true})}
                     subcorpus={this.props.subcorpus}
                     subcorpus_pds = {this.props.subcorpus_pds}
                     unset_callout_clickable = {() => this.setState({'turn_off_normal_mouse_up_down': false})}
                     width = {this.state.width}
                     q={this.props.q}
                     y_axis_width = {this.props.y_axis_width}
                    />
    }

    let dt = moment(this.props.black_selector_stick_location)

    let background = ""
    let marker = ""

    if (dt.isValid() && this.props.black_selector_stick_location != "19691231"){ // .toDate()

        /*if(dt.format("YYYYMMDD") === this.props.hovered_pd){
          hover_date_line = "" // dont show hover line if it is the same as the focal line
        }*/

        let dt_before_shift = moment(this.props.black_selector_stick_location)
        if(moment(this.props.black_selector_stick_location) < moment("04-01-1988")){
          dt = moment("04-01-1988")
        }


        dt = dt.toDate()

        let tooltip = <span> <span style={{"color":"#1a0dab"}}>{hl}</span><br/> <span style={{"color":"grey"}}>{moment(pd).format("MMM DD,YYYY")}</span></span>

        let full_date =  moment(this.props.black_selector_stick_location).format("MMM DD, YYYY")

        full_date = String.fromCharCode(160) + full_date + String.fromCharCode(160)

        let offset = 50

        if(moment(this.props.black_selector_stick_location) > moment("2006-01-01")){
          dt = moment("2006-01-01").toDate()
        }

        let focal_color = this.props.is_read ? "lightgrey" : "black"

        focal_date_line = <Tippy theme='light-border' delay={0} content={tooltip}>
                               <line key={"between_date_and_axis"}
                                     x1={lateralize(dt_before_shift.toDate(), lateral_scale) + 1}
                                     y1="14"
                                     x2={lateralize(dt, lateral_scale) + 1}
                                     y2="24"
                                     stroke={focal_color}
                                     strokeWidth="1.5px"/>
                             </Tippy>



        let is_checked_off = this.props.is_checked_off

        full_date = <Tippy theme='light-border' delay={0} content={tooltip}><div style={{"paddingTop":"-5", "width": "110", "float":"right"}}>{full_date}</div></Tippy>

        marker =   <foreignObject 
                      x={lateralize(dt, lateral_scale) - width }
                      y={y_loc}
                      key={"flsfod_g"}
                      width={130}
                      fill="white"
                      opacity="1"
                      height={30}>
                          <div style={{"fontSize":"small", "textAlign":"center", "height":"100%"}}>
                            {full_date}
                          </div>
                    </foreignObject>

        background = make_background(this.props.black_selector_stick_location, offset, tooltip)
    }

    // the +1 in x1 and x2 is to make it line up w/ the chart rug points

    let small_ticks = ticks.slice(1, ticks.length);

    let tooltipcolor = "yellow"

    let binned_data = this.props.binned_data.slice(1, this.props.binned_data.length);

    if(this.props.subcorpus === this.props.q){
      marker = ""
      background = ""
    }

    if (this.props.q === this.props.subcorpus) {
        global_rugs = ""; // no global rugs
    }

    if(this.props.width < 0){
        return <svg height={0} width={0}/>
    }else{
        return (
        <svg height={this.props.height} width={this.props.width} style={{"borderLeft":"0px solid pink"}}>
        <line key={"sd03q"} x1="0" y1="0" x2={0} y2="14" stroke="black" strokeWidth="1"/>
        <line key={"sd0s3"} x1="0" y1="14" x2={this.props.width} y2="14" stroke="black" strokeWidth="1"/>
        <text key={"sdsd0a3"} x={x_label_height} y={y_label_height} fontSize=".9em"> Publication date</text>
        {small_ticks.map((o, i) => make_tick(o, i, this.props.q, binned_data, tooltipcolor))}
        {background}
        {marker}
        {rug_plots}
        {global_rugs}
        </svg>
        );
    }

  }
}