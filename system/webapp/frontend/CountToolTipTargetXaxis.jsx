// @flow

'use strict';
/*
 x-axis.jsx
*/

var React = require('react');
var d3 = require('d3');

import moment from "moment"
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

type Props = {
  foo: number,
  height: number,
  width: number,
  lateralize:<T>(T, T) => number,
  lateral_scale:<T>(T) => T,
  black_selector_stick_location: string,
};


export default class CountToolTipTargetBarChart extends React.Component<Props, State>{

  constructor(props: Props) {
    super(props);
  }

  render() {


    let all_but_last = this.props.input_datas.slice(0, this.props.input_datas.length -1)

    var targets = all_but_last.map(function(count, index){

                                      var x = this.props.x_scale(new Date(this.props.keys[index]))

                                      var x2 = this.props.x_scale(new Date(this.props.keys[index + 1]))

                                      let diff = 20

                                      let stroke = "grey"
                                      let strokeOpacity = 0.0 // set to 0 for production, 1 for debug

                                      let bar_width = x2 - x
                                      if(bar_width < 0){
                                        bar_width = 0
                                      }

                                      let color = this.props.q === this.props.subcorpus ? "black": "#d0021b"
                                      return <Tippy key={index + "ojseeei"} theme='light-border' delay={300} content={<span> <span style={{"fontWeight":"bold"}}>{moment(this.props.keys[index]).format("YYYY")}</span> <br/> {this.props.input_datas[index] + " articles with "}<span style={{"fontWeight": "bold", "color": color}}>{this.props.name}</span> </span>}>
                                                  <rect 
                                                      className={"rect-target"}
                                                      key={index + "ojsei"}
                                                      x={x}
                                                      y={diff}
                                                      width={20}
                                                      height={20}
                                                      style={{"fill":color,
                                                              "stroke": stroke,
                                                              "strokeWidth": .3,
                                                              "fillOpacity": .5,
                                                              "strokeOpacity": strokeOpacity}} 
                                                  />
                                             </Tippy>
                                  }.bind(this))

    return (targets)
  }
}