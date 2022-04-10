// @flow
/*
ToolTipTube.jsx
*/

var React = require('react');

import moment from 'moment'

function ToolTipTube (props: Props){

    let ix = props.keys.indexOf(props.mouse_date)

    let yr = <span style={{"fontWeight": "bold", "color": "black"}}>{moment(props.mouse_date).format("YYYY")}</span>
    let count = <span style={{"color":"black"}}>{props.input_datas[ix]}</span>
    let fcount = props.f_data[ix]

    let rect = <rect
                y="0"
                x={props.end_pos}
                opacity={".5"}
                height={props.chart_height + 100}
                width={2}
                stroke={"black"}
                strokeWidth="1"
                fill={"black"}
                />

    let color = (props.q === props.subcorpus) ? "black" : window.q_color

    let description = <><span>{" articles with "}</span>
                        <span style={{"fontWeight": "bold", "color": color}}>{props.q}</span></>

    let f_part = props.f.length > 0 ? <><br/><span style={{'color':'black'}}>{fcount}{" articles with "}</span><span style={{"color": window.q_color,"fontWeight": "bold"}}>{props.q}</span><span>{" and "}</span><span className={"fcolor"} style={{"fontWeight": "bold"}}>{props.f}</span> </> : ""

    let end_pos = (props.end_pos < 850) ? props.end_pos : 850

    let width = 180

    if(props.f.length > 0){
      width = 190
    } 

    let fo =  <foreignObject x={end_pos} y="5" width={width} height={props.chart_height - 10}>
                  <div style={{"border":"1px solid black", "backgroundColor":"white", "opacity":.9, "fontSize": "10px"}}>
                    {yr}
                    <br/>
                    {count}{description}
                    {f_part}
                  </div>
              </foreignObject>

    if(props.mouse_in_chart || !moment(props.mouse_date).isValid()){
        rect = ""
        fo = ""
    }

    return (<>{rect}{fo}</>)
}

function areEqual(prevProps, nextProps) {
  /*
  return true if passing nextProps to render would return
  the same result as passing prevProps to render,
  otherwise return false
  */
  if(prevProps.end_pos === nextProps.end_pos){
      if(prevProps.mouse_in_chart === nextProps.mouse_in_chart){
          return true
      }
  }

  return false
}

export default React.memo(ToolTipTube, areEqual);
