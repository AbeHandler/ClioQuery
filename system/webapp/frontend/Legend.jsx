// @flow
/*
Legend.jsx
*/

var React = require('react');
import CountMarker from "./CountMarker.jsx"
import GreySquare from "./GreySquare.jsx"

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import 'tippy.js/themes/light-border.css';

import classNames from 'classnames'

export default class Legend extends React.Component{


     constructor(props) {
        super(props);
        this.state = {selected: []}
     }

      toggleSelected(selectedArray, ix){

          let remove_with_this_n_mentions = {0: [1,2], 1: [3,4], 2: [5, 100000000000]}

          this.props.clear_force_selected()

          this.props.toggleLegend(ix)
          
      }

      get_is_selected(ix){
          if(ix === 0 && this.props.legend_button_one){
            return true
          }
          if(ix === 1 && this.props.legend_button_two){
            return true
          }
          if(ix === 2 && this.props.legend_button_three){
            return true
          }
          return false
      }

      get_rec(ix, selected, preselected, f, all_data_f, q, is_f_legend){

          let i

          let names = classNames({"bold_subcorpus": this.props.q === this.props.subcorpus},
                                 {"bold_q": this.props.q !== this.props.subcorpus })

          let number =  ix === 4 ? "5 or more " :  (ix + 1).toString()
          

          let word = q
          let word_color = window.q_color
          if(is_f_legend){
             word = f
             word_color = window.f_color
          }


          let tooltip_text = <span>A square like this means the document includes mentions of {number} mentions of <span className={names} ><span style={{"color":word_color}}>{word}</span></span></span>
          

          let sq = <CountMarker sidePx={window.mini_square_size}
                              headline={"NA"} 
                              all_data_f={all_data_f}
                              f={f}
                              q={q}
                              no_tooltip={true}
                              nmentionsf={ix + 1}
                              nmentions={ix + 1}/>

          if(this.props.q === this.props.subcorpus){
              sq = <GreySquare sidePx={window.mini_square_size}
                               headline={"NA"} 
                               all_data_f={all_data_f}
                               f={f} nmentions={ix + 1}/>
          }

          let r =  <div style={{"width":"20px", 
                                  "marginLeft":"3px",
                                  "paddingTop":"2px",
                                  "float":"left",
                                  "overflow":"hidden"}}>
                                  {sq}
                    </div>

          let color = "white"

          let borderColor = "#707070"
          let fontColor = "#707070"

          let width
          if(ix == 2){
            width = "55px"
          }else if(ix == 0){
            width = "60px"
          }else{
            width = "65px"  
          }

          let align = "left"
          if(ix === 0){
            align = "left"
          }
          if(ix === 2){
            align = "right"
          }

          let ixsr = (ix + 1).toString()
          
          if (ix === 4 && !this.props.is_f_legend){
            ixsr = <span>{ixsr + "+   "}</span>
          }

          if (ix === 3 && this.props.is_f_legend){
            ixsr = <span>{ixsr + "+   "}&nbsp;</span>
          }

          let ix2 = <div style={{"color":"black", "width": 10, "fontSize": "10px", "float": "left", "paddingBottom": 6}}>{ixsr}</div>

          let mid = <Tippy theme='light-border' delay={600} content={<span>{tooltip_text}</span>}>
                      <div onClick={() => this.setState({"selected": this.toggleSelected(this.state.selected, ix) })} 
                           style={{"borderRadius": "2px",
                                   "color": fontColor,
                                   "height":"19px",
                                   "border": "0px solid red",
                                   "float": align,
                                   "pointer":"cursor",
                                   "width":"100%"}}>{ix2}{r}</div>
                    </Tippy>


          return <div key={"pdpdpd" + ix.toString()} 
                      style={{"float":"left", 
                              "width":"20%",
                              "border":"0px solid green"}}>
                        {mid}
                  </div> 

                      
      }

    render(){
      let ixs = [0, 1, 2, 3, 4]
      if(this.props.is_f_legend){
        ixs = [-1, 0, 1, 2, 3]
      }

      let ok = <div style={{"height":"20", "width":"100%"}}> 
                {ixs.map((ix) => this.get_rec(ix, this.props.selected, this.props.preselected, this.props.f, this.props.all_data_f, this.props.q, this.props.is_f_legend))}
                </div>

      return(ok)
    }

}