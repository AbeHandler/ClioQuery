var React = require('react');

import moment from 'moment'
import RugPoint from "./RugPoint.jsx"


import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import 'tippy.js/themes/light-border.css';

export default class GlobalRugs extends React.Component{

    constructor(props) {
        super(props);
    }

    render(){

        let globals = this.props.globals

        let Nglobals = globals.length.toString()

        let set_long_message = false

        if(this.props.globals.length === 0){
            return ""
        }


        let headlines_in_feed = this.props.filtered_in.map((x) => x['headline'])

        globals = globals.filter((x) => headlines_in_feed.indexOf(x["headline"]) >= 0)

        var global_ltrs = globals.map(function(period, i){

                                    var pubdate = moment(period['pubdate'], "YYYYMMDD")
                                    let j = pubdate.toDate();
                                    var x_scale = this.props.x_scale
                                    
                                    let x = x_scale(j)

                                    let xx = ['Topics of The Times; Cowardice on Clean Needles', 'New Hope for Addicts?']

                                    if(xx.indexOf(period['headline']) !== -1){
                                        console.log(period['headline'], x)
                                    }


                                    return(<Tippy key={i + "fod_gga" + x.toString()} theme='light-border' delay={0} content={<span> <span style={{"color":"#1a0dab"}}>{this.props.headline}</span><span style={{"color":"grey"}}>{moment(period["pubdate"]).format("MMM DD,YYYY")}</span></span>}>
                                            <text x={x - 4.25}
                                                  y={8}
                                                  onMouseDown={function(e){
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                        
                                                        if(this.props.callout_clickable){
                                                            this.props.report_click_on_callout(period)
                                                        }else{
                                                            console.log("not clickable")
                                                        }
                                                      }.bind(this)
                                                 }
                                                 style={{"fontSize":"12px", "cursor":"pointer"}} 
                                                 key={i + "fo_gg" + x.toString()}>
                                               {"★"}
                                            </text>
                                            </Tippy>)                                  
                        }.bind(this));

        return(<g key="sok3s">{global_ltrs}</g>)

    }
}
