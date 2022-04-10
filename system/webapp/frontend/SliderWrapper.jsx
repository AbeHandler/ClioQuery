// @flow
/*
Slider.jsx
*/

var React = require('react');
import {Slider} from 'antd';
import 'antd/dist/antd.css';

export default class SliderWrapper extends React.Component{


    constructor(props) {
        super(props);
        this.state = {"force_to_zero": false, "force_to_previous": false}
    }
 
    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      if (this.props.f !== prevProps.f && this.props.f.length > 0) {
         if(!this.state.force_to_zero){
            this.setState({"force_to_zero": true})
         }
      }

      if(this.props.f.length === 0 && prevProps.f.length > 0){
          this.setState({"force_to_previous": true})
      }

      //force to previous only happens once
      if(this.props.f.length === 0 && this.state.force_to_previous){
          this.setState({"force_to_previous": false})
      }

      if(this.props.f.length > 0 && this.state.force_to_zero){
          console.log("unset force to zero") //happens only once
          this.setState({"force_to_zero": false})
      }

    }

    render(){

      let min = 1
      let max = 5
      let defaultValue = max

      if(this.props.is_f_legend){
         min = 0
         max = 4
         defaultValue = max
      }

      let ok
      let marks = {}

      for (var i = 0; i < max + 1; i++) {
        marks[i] = ""
      }

      let plus = 1
      if(this.props.f.length > 0){
          plus = 0
      }

      if(this.state.force_to_zero && this.props.f.length > 0){
            ok = <Slider min={min} defaultValue={defaultValue}
                         value={max}
                         marks={marks}
                         reverse={true}
                         tooltipVisible={false} //this.props.reportSlider(value)
                         onChange={(value) => this.props.reportSlider(max - value + plus)} />  
       }else{
            if(this.state.force_to_previous){
              ok = <Slider min={min} defaultValue={defaultValue} 
                         max={max} tooltipVisible={false}
                         marks={marks}
                         reverse={true}
                         value={max}
                         onChange={(value) => this.props.reportSlider(max - value + plus) } /> //this.props.reportSlider(max - value + 1)} />
            }else{
              ok = <Slider min={min} defaultValue={defaultValue} 
                         max={max} tooltipVisible={false}
                         marks={marks}
                         reverse={true}
                         onChange={(value) => this.props.reportSlider(max - value + plus) } /> //} />
            }
       }

      return(ok)

    }

}