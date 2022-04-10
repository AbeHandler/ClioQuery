// @flow
/*
PerMentionSlider.jsx
*/

var React = require('react');

import Legend from "./Legend.jsx"
import SliderWrapper from "./SliderWrapper.jsx"

export default class PerMentionSlider extends React.Component{

     constructor(props) {
        super(props);
     }

     render(){

        let word = this.props.q
        let color = window.q_color
        if(this.props.f.length > 0){
            word = this.props.f
            color = window.f_color
        }

        let word_div = <span >{"of "}<span style={{"color": color, "fontWeight": "bold"}}>{word}</span></span>

        let ou = <div  style={{"paddingTop":1, "paddingLeft":5, "height":"100%", "width":"100%", "border": "0px solid blue"}}>
                    <div style={{"height":"100%", "color": 'black',
                                 "fontSize": 12, "textAlign": "right",
                                 "paddingRight": 4,
                                 "width":"130px", "float":"left",
                                 "border":"0px solid blue"}}>
                        <div style={{"textAlign":"center",  "height":"35%", "fontSize": 10, "border":"0px solid red"}}>
                        {"Filter by # mentions"}
                        </div>
                        <div style={{"textAlign":"center", "fontSize": 10, "height":"65%", "border":"0px solid green"}}>
                          {word_div}
                        </div>

                    </div>
                    <div style={{"height":"100%", "width":"220px", "float":"right", "border":"0px solid grey"}}>
                          <div style={{"height":"35%", "width":"100%",  "border":"0px solid grey"}}>
                            
                            <div className="sliderWrapperHolder" style={{"marginBottom": 1.5,  "float": "right", 
                                                                          "height":"100%", "width":"92.5%",
                                                                          "paddingTop":1, "border":"0px solid green"}}>
                                <SliderWrapper f={this.props.f}
                                               is_f_legend={this.props.is_f_legend}
                                               filter_threshold={this.props.filter_threshold}
                                               reportSlider={this.props.reportSlider} />
                            </div>

                            <div style={{"float": "left", "height":"100%", "width":"7%",  "border":"0px solid blue"}}>
                                &nbsp;
                            </div>

                          </div>
                          <div style={{"height":"65%", "width":"99.5%",  "border":"0px solid grey"}}>
                            <Legend  
                              f={this.props.f}
                              q={this.props.q}
                              is_f_legend={this.props.is_f_legend}
                              subcorpus={this.props.subcorpus}
                              clear_force_selected = {this.props.clear_force_selected}
                              force_selected_to_empty={this.props.force_selected_to_empty}
                              legend_button_one = {this.props.legend_button_one}
                              legend_button_two = {this.props.legend_button_two}
                              legend_button_three = {this.props.legend_button_three}
                              toggleLegend={this.props.toggleLegend}
                              all_data_f={this.props.all_data_f}/>
                          </div>
                      </div>
                  </div>

        return(ou)
    }

}