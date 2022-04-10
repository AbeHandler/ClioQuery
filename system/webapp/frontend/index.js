import React from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

import moment from 'moment'
import TemporalLinePlot from './App2';
import helpers from "./helpers.js"
var d3 = require('d3');

window.nmentions2n = function nmentions2n(nmentions, mx){

  if(nmentions > 4){
    return mx
  }else{
    return nmentions
  }

}

window.hover_color = "rgb(234, 239, 242)"

window.n2color = function(n, mx){

    //https://color-hex.org/color/c20f08

    if(n > mx){
       n = mx
    }

    return d3.interpolateLab("white", window.q_color)(n/mx)

}

window.n2colorF = function(n, mx){

    //https://color-hex.org/color/c20f08

    if(n > mx){
       n = mx
    }


    return d3.interpolateLab("white", window.f_color)(n/mx)

}

window.n2colorGrey = function(n, mx){

    if(n > mx){
       n = mx
    }

    return d3.interpolateLab("white", "black")(n/mx)

}

window.font_size = "12px"

$.post("get_color", function(data){
    data = JSON.parse(data)
    console.log(data)
    window.f_color = data['f_color']
    window.q_color = data['q_color']
    window.readcolor = data['readcolor']
    window.unreadcolor = data["unreadcolor"]
    window.savedcolor = data['savedcolor']
    window.querybarcolor = data['querybarcolor']
})

window.mySortFunction = function myFunction(a, b) {
                              //break ties
                              if(a["pubdate"] === b["pubdate"]){
                                  if(a["headline"] > b['headline']){
                                     return 1
                                  }else{
                                     return -1
                                  }
                              }
                              return moment(a["pubdate"]).toDate() - moment(b["pubdate"]).toDate()
                        }

window.nav_height = 40
window.labelheight = 30
window.itemsize = 57
window.seen = []
window.labelspace = 0
window.query_width = "160px"

window.mini_square_size = 12

window.mini_slice_height = window.mini_square_size + 5

let bin_by = "year"

$.post("get_guid", function( data ) {
          window.guid = data
        });

ReactDOM.render(
    <TemporalLinePlot 
       x_axis_height={50} 
       width_to_height_ratio={20}
       bin_by={bin_by}
    />
, document.getElementById('root'));
