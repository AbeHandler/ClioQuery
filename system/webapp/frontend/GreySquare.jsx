// @flow
/*
YAxis.jsx
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
              q: string,
              f: string}


export default function GreySquare (props: Props){

    var mx = 5

    var n = window.nmentions2n(props.nmentions, mx)

    let color = window.n2colorGrey(n, mx)

    let opacity = 1

    return(<Tippy theme='light-border' delay={600} content={<span>This story has {props.nmentions} mentions of <span style={{"fontWeight":"bold"}}>{props.q}</span></span>}>
           <div style={{"width":props.sidePx,
                        "border": ".5px solid grey", 
                        "height":props.sidePx,
                        "opacity": opacity,
                        "backgroundColor": color,
                        "float":"left",
                        "overflow":"hidden"}}></div>
            </Tippy>)
}
