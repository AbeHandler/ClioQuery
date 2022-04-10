var React = require('react');

import moment from 'moment'
import RugPoint from "./RugPoint.jsx"

export default class RugPoints extends React.Component{

    constructor(props) {
        super(props);
        this.state = {"current_rug": -1}
    }

    shouldComponentUpdate(nextProps, nextState) {
       if(this.props.checked_off.length !== nextProps.checked_off.length){
            return true
       }
       if(this.props.q !== nextProps.q){
            return true
       }
       if(this.state.current_rug !== nextState.current_rug){
            return true
       }
       if(this.props.feedmode !== nextProps.feedmode){
            return true
       }
       if(this.props.x_scale !== nextProps.x_scale){
            return true
       }
       if(this.props.f !== nextProps.f){
            return true
       }
       return false
    }

    get_rug_point(period, i){

        var pubdate = moment(period['pubdate'], "YYYYMMDD")
        let j = pubdate.toDate();
        var x_scale = this.props.x_scale

        let x = x_scale(j)
        let y = 4 // offset from top of x axis box
        let correction_for_checked_off = 0

        let is_read = this.props.checked_off.indexOf(period['headline']) >= 0

        let is_hovered = period["is_hovered"]

        let key = "rugpointABC" + i.toString() 

        let left_offset = 4

        let global_hls = this.props.globals.map(x => x['headline'])

        let is_saved = global_hls.indexOf(period['headline']) >= 0

        let is_focal = this.props.doc_hl === period.headline

        //i.e. not initialized
        let not_init = this.props.black_selector_stick_location !== "19691231"

        return <RugPoint 
                 all_data_f={this.props.all_data_f}
                 current_rug={this.state.current_rug === i}
                 headline={period.headline}
                 is_focal={is_focal && not_init}
                 hover_index={this.props.hover_index}
                 index={i}
                 f={this.props.f}
                 q={this.props.q}
                 subcorpus={this.props.subcorpus}
                 is_read={is_read}
                 is_saved={is_saved}
                 is_hovered={is_hovered}
                 key={key}
                 left_offset={left_offset}
                 nmentions={period.nmentions}
                 nmentionsf={period.nmentions}
                 pubdate={period.pubdate}
                 report_click_on_callout={this.props.report_click_on_callout}
                 set_current_rug={(current_rug) => this.setState({"current_rug": current_rug})}
                 set_callout_clickable={this.props.set_callout_clickable}
                 unset_callout_clickable={this.props.unset_callout_clickable}
                 x={x}
                 y={y}
                 />
    }

    render(){

     var all_points
     let focal_ix = -1

     let all_data = this.props.feedmode !== "global" ? this.props.all_data : this.props.globals

     if(this.props.black_selector_stick_location !== -1){
        for (var i = 0; i < all_data.length; i++) {
          if(all_data[i]['pubdate'] === this.props.black_selector_stick_location){
             focal_ix = i
          }
        }
     }

     var not_focal = all_data.filter((pt, i) => i !== focal_ix)

     if(focal_ix !== -1){       // there is a focal rug point, i.e. blackselectorstick location
         var focal = [all_data[focal_ix]]
         all_points = not_focal.concat(focal) // the point of this is to put focal last on SVG so the 
                                              // "z-index" is highest. Quotes b/c SVG doesnt have z-index
     }else{
         all_points = not_focal
     }

     let global_hls = this.props.globals.map(x => x['headline'])


     for (var i = 0; i < all_points.length; i++) {
         all_points[i]["is_focal"] = i === focal_ix
         all_points[i]["is_hovered"] = this.props.hover_index === i
         all_points[i]['is_saved'] = global_hls.indexOf(all_points[i]['headline']) >= 0
     }

     //saved comes first 
     all_points.sort(function(a, b) {
            
            if(a['is_saved'] || a['is_hovered'] || a["is_focal"]){
                return -1 // a comes first
            }else{
                return 1 // b comes sfirst
            }

    });

     var rug_plots = all_points.map(this.get_rug_point.bind(this))

     return(rug_plots)

    }
}
