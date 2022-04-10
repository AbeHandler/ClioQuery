// @flow
/*
CountMarker.jsx
*/

import Tippy from '@tippyjs/react';
import 'tippy.js/themes/light-border.css';

var React = require('react');

type Props = {all_data_f: any,
              check: boolean,
              nmentions: number, 
              sidePx: number,
              headline: string,
              force_blue: boolean,
              f: string}


export default function CountMarker (props: Props){

    var mx = 5

    var n = window.nmentions2n(props.nmentions, mx)

    let color = window.n2color(n, mx)

    let f_headlines = []

    let font_color = window.q_color
    let word = props.q
    let nmentions = props.nmentions

    if(props.f.length > 0){
        f_headlines = props.all_data_f.map((a) => a["headline"])
        color = window.n2colorF(props.nmentionsf, mx)
        font_color = window.f_color
        word = props.f
        nmentions = props.nmentionsf
    }

    if(props.no_tooltip){
      return(<div style={{"width":props.sidePx,
                          "border": ".5px solid grey", 
                          "height":props.sidePx,
                          "backgroundColor": color,
                          "float":"left",
                          "overflow":"hidden"}}></div>)
    }else{
        return(<Tippy theme='light-border' delay={600} content={<span>This story has {nmentions} mentions of <span style={{"fontWeight":"bold", "color": font_color}}>{word}</span></span>}>
                <div style={{"width":props.sidePx,
                            "border": ".5px solid grey", 
                            "height":props.sidePx,
                            "backgroundColor": color,
                            "float":"left",
                            "overflow":"hidden"}}></div>
                </Tippy>)
    }

}
