// @flow
/*
YAxis.jsx
*/

var React = require('react');
var d3 = require('d3');



type Props = {
    max:number,
    height:number,
    y_axis_width:number
}


export default function YAxis (props: Props){

    let xp = props.y_axis_width
    let yend = props.height;

    var scale = props.y_scale
    let ticks;

    if (props.max<7){
          ticks = scale.ticks(props.max);
    }else{
          let nticks = Math.floor(props.height/20); //fontsize * 2 == 22
          ticks = scale.ticks(nticks); 
    }
    let height = props.height;
    if(height.toString() === "NaN"){
        height = 0;
    }
    let tot = 13;
    let xtot = -1 * (height * .75);

    let ou = <svg onClick={() => addTodo("hi")} width={props.y_axis_width} height={height}>
                <line x1={xp} y1="0" x2={xp} y2={height} stroke="black" strokeWidth="1" />
                   {ticks.map(function(object, i){

                      let y = yend - scale(object) + 3
                      if(object === 0){
                          y -= 0
                      }
                      return <text fontSize=".7em" textAnchor="end" key={i + "txt"} x="45" y={y} fill="black">{object}</text>
                      })}
                   {ticks.map(function(object, i){
                      return <line key={i + "tick"} x1="48" y1={yend - scale(object)} x2="54" y2={yend - scale(object)} style={{"stroke":"black", "strokeWidth":"1px"}}/>
                      })}
                <text fontSize=".9em" x={xtot} y={tot} transform="translate(0, 15) rotate(270,0,0)"># Articles</text>
             </svg>

    if(props.y_axis_width < 0){
       ou = ""
    }

    return (ou)
}

