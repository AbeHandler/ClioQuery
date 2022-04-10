/*
Chart.jsx
*/

var React = require('react');
var d3 = require('d3');
import moment from 'moment'

import XAxis from "./XAxisMin.jsx";
import YAxis from "./YAxis.jsx";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import ToolTipTube from "./ToolTipTube.jsx"

export default class Chart extends React.Component{

    get_x_scale(width, y_axis_width, keys){

        let str = moment(keys[0]).toDate()

        let end = moment(keys[keys.length - 1])

        end.add(365,'days') // not assuming 1 year bins. TODO

        end = end.toDate()

        try{
            return d3.scaleTime()
                              .domain([str, end])
                              .range([0, width - y_axis_width]);
        } catch(e){
            return d3.scaleTime()
                              .domain([str, end])
                              .range([0, 0]); //has not loaded yet
        }

    }

    get_y_scale(counts){
      //let h = this.state.width / this.props.width_to_height_ratio;
      let actual_plot_height = this.props.height - this.props.x_axis_height
      let h = actual_plot_height - 3 // -3 == a little padding on top to avoid weird looking lines cut off

      return d3.scaleLinear()
                            .domain([0, Math.max(...counts)])
                            .range([3, h])
    }

    get_path_string(input_datas, actual_plot_height, counts_for_y_scale){

        let bottom = actual_plot_height;
        let x_scale = this.get_x_scale(this.state.width, 
                                       this.props.y_axis_width,
                                       this.props.keys);
        let y_scale = this.get_y_scale(counts_for_y_scale);

        let output = "M 0 " + bottom + " ";
        for (let i = 0; i < input_datas.length; i++) {
            let diff = actual_plot_height - parseFloat(y_scale(input_datas[i]));
            output = output + " L " + x_scale(new Date(this.props.keys[i])) + " " + diff;
        }

        if(actual_plot_height.toString() == "NaN"){
            return ""; //avoid error on init
        }
        return output; // + "L 5 30 L 10 40 L 15 30 L 20 20 L 25 40 L 25 50 Z";
    }

    get_path_string_line_chart(input_datas, actual_plot_height, counts_for_y_scale){
        //same as above, but makes a bar chart

        let x_scale = this.get_x_scale(this.state.width, 
                                       this.props.y_axis_width,
                                       this.props.keys);
        let y_scale = this.get_y_scale(counts_for_y_scale);

        let bottom = actual_plot_height - parseFloat(y_scale(input_datas[0]));

        let output = "M 0 " + bottom + " ";

        let last_y = 0

        for (let i = 0; i < input_datas.length; i++) {
            let diff = actual_plot_height - parseFloat(y_scale(input_datas[i]));
            output = output + " L " + x_scale(new Date(this.props.keys[i])) + " " + diff;
            last_y = diff
        }

        if(actual_plot_height.toString() == "NaN"){
            return ""; //avoid error on init
        }
        
        // jump to end
        output = output + " L " + x_scale(x_scale.domain()[1]) + " " + last_y;

        return output; // + "L 5 30 L 10 40 L 15 30 L 20 20 L 25 40 L 25 50";

    }

    get_path_string_bar_chart(input_datas, actual_plot_height, counts_for_y_scale){
        //same as above, but makes a bar chart
        let bottom = actual_plot_height;
        let x_scale = this.get_x_scale(this.state.width, 
                                       this.props.y_axis_width,
                                       this.props.keys);
        let y_scale = this.get_y_scale(counts_for_y_scale);

        let output = "M 0 " + bottom + " ";

        var last_height = bottom

        for (let i = 0; i < input_datas.length; i++) {
 
            // Make a bar, this looks ahead from keys[i]
            // each bar is 3 moves: up, right and down
            // L 0 50 L 10 50 L 10 60 


            if(i < input_datas.length - 1){

                var x_start = x_scale(new Date(this.props.keys[i]))
                var x_next = x_scale(new Date(this.props.keys[i + 1]))

                let diff = actual_plot_height - parseFloat(y_scale(input_datas[i]));

                var bar_y = diff = actual_plot_height - parseFloat(y_scale(input_datas[i]))

                var U_move = "L " + x_start + " " + bar_y

                var R_move = "L " + x_next + " " + bar_y

                var D_move = "L " + x_next + " " + last_height

                output = output + U_move + R_move + D_move

            }


        }
        output = output + "L " + x_scale(new Date(this.props.keys[input_datas.length - 1])) + " " + bottom;
        if(actual_plot_height.toString() == "NaN"){
            return ""; //avoid error on init
        }
        return output; // + "L 5 30 L 10 40 L 15 30 L 20 20 L 25 40 L 25 50 Z";
    }

 constructor(props) {
    super(props);
    this.myInput = React.createRef();

    this.state = {
            width: 0,
            panel_width: 0, 
            mouse_x: -1,
            turn_off_normal_mouse_up_down: false,
            'mouse_in_chart': false
    };

  }

  lateralize(i, lateral_scale) {
    return lateral_scale(i);
  }

  handle_mouse_move(e_pageX) {

    let p = this.mouse2date(e_pageX)

    //alert UI that mouse is moving
    this.props.mouse_move_in_chart(p);

  }


  mouse2date(x_loc){
     let x_loc_adjusted = x_loc - this.state.offset_left;
     let lateral_scale = this.get_x_scale(this.state.width, 
                                          this.props.y_axis_width,
                                          this.props.keys);
     return lateral_scale.invert(x_loc_adjusted)
  }


  get_stroke_color_r(drag_l_or_r){
    if (drag_l_or_r){
      return "grey";
    }else{
      return "black"
    }
  }


  componentDidMount() {
    const width = document.getElementById('chart_div').clientWidth;
    var offset_left = document.getElementById('main_chart').getBoundingClientRect().left;
    this.setState({"width": width,
                   "panel_width":width,
                   "offset_left":offset_left});

  }

  get_mouse_x_position(){
    let dt = moment(this.props.mouse_date).toDate();
    let x_scale = this.get_x_scale(this.state.width,
                                   this.props.y_axis_width,
                                   this.props.keys);

    let x_loc_adjusted = x_scale(dt);
    return x_loc_adjusted;
  }



  render() {


    let hide_corpus_on_query = true;

    let counts = this.props.subcorpus_data

    if(hide_corpus_on_query && this.props.q !== this.props.subcorpus){
      counts = this.props.q_data
    }

    {/* actual plot height is the height of the line plot itself rather than the height of the chart component which also includes x axis */}
    let actual_plot_height = this.props.height - this.props.x_axis_height
    if (actual_plot_height < 0){
        actual_plot_height = 0;
    }

    {/* actual plot width is the width of the line plot itself rather than the width of the chart component which also includes y axis */}
    let actual_plot_width = this.state.width - this.props.y_axis_width

    let lateral_scale = this.get_x_scale(this.state.width,
                                         this.props.y_axis_width,
                                         this.props.keys);

    let x_scale = this.get_x_scale(this.state.width, 
                                   this.props.y_axis_width,
                                   this.props.keys)

    let height_scale = this.get_y_scale(counts);

    let ps = ""
    let corpus_path_string = ""
    if (actual_plot_height > 0 && this.props.numQ > 0){
       ps = this.get_path_string_line_chart(this.props.q_data, actual_plot_height, counts)
       corpus_path_string = this.get_path_string_line_chart(this.props.subcorpus_data, actual_plot_height, counts)
    }

    let opacity = .7

    /* to change from line to filled line chart, set fill to a color below 
       and remove the stroke property
    */ 

    let q_line = <path onMouseMove={e =>this.setState({mouse_x:e.pageX})} 
                       d={ps} stroke={window.q_color} fill="none" strokeWidth="3" opacity={opacity}/>

    if(this.props.q === this.props.subcorpus){
        q_line = ""
    }

    let corpus_line = <path onMouseMove={e =>this.setState({mouse_x:e.pageX})} 
                            d={corpus_path_string} stroke={"black"} strokeWidth="3"
                            fill="none" opacity={opacity}/>

    let f_line = ""

    if (this.props.f.length > 0){
      let f_ps = this.get_path_string_line_chart(this.props.f_data, actual_plot_height, counts)
      f_line = <path onMouseMove={e =>this.setState({mouse_x:e.pageX})} d={f_ps} fill="none" 
                      stroke={window.f_color} opacity={opacity} strokeWidth={3}/>
    }

    let stroke_color_r = this.get_stroke_color_r(this.props.mouse_is_dragging);
    
    let end_pos = this.get_mouse_x_position();

    let max = Math.max(...counts);

    let y_axis = <YAxis max={max}
                       height={actual_plot_height}
                       y_scale={this.get_y_scale(counts)}
                       y_axis_width={this.props.y_axis_width}/>

    let hovered_pd

    try{
      hovered_pd = this.props.all_data[this.props.hover_index]['pubdate']
    }catch(e){
      hovered_pd = ""
    }

    let hovered_hl
    try{
      hovered_hl = this.props.all_data[this.props.hover_index]['headline']
    }catch(e){
      hovered_hl = "0-190baysjekrua"
    }

    //console.log(this.props.checked_off, hovered_hl, this.props.checked_off.indexOf(hovered_hl))

    let x_axis = <XAxis 
                        actual_plot_height={actual_plot_height}
                        all_data={this.props.all_data}
                        all_data_f={this.props.all_data_f}
                        binned_data={this.props.q_data}
                        black_selector_stick_location={moment(this.props.black_selector_stick_location).format("YYYYMMDD")}
                        checked_off={this.props.checked_off}
                        doc_hl={this.props.doc_hl}
                        doc_hl_is_hovered_hl={this.props.doc_hl === hovered_hl}
                        f={this.props.f}
                        filtered_in={this.props.all_data}
                        get_x_scale={this.get_x_scale}
                        globals={this.props.globals}
                        height="50"
                        height_scale={height_scale}
                        hover_headlne={headline}
                        hover_index={this.props.hover_index}
                        hovered_is_read={this.props.checked_off.indexOf(hovered_hl) >= 0}
                        hovered_pd={hovered_pd}
                        is_read = {this.props.checked_off.indexOf(this.props.doc_hl) >= 0}
                        keys={this.props.keys}
                        lateral_scale={lateral_scale}
                        lateralize={this.lateralize}
                        q={this.props.q}
                        q_data={this.props.q_data}
                        report_click_on_callout={(e) => this.props.report_click_on_callout(e)}
                        scrolled={this.props.scrolled}
                        subcorpus={this.props.subcorpus}
                        subcorpus={this.props.subcorpus}
                        width={actual_plot_width}
                        x_scale={this.get_x_scale(this.state.width, this.props.y_axis_width, this.props.keys)}
                        x_scale={x_scale}
                        y_axis_width={this.props.y_axis_width}
                        black_selector_stick_location={this.props.black_selector_stick_location}
                        />

    if (actual_plot_height < 0){
        x_axis = ""
        y_axis = ""
    }


    let tolltiptube = <ToolTipTube end_pos={end_pos}
                        mouse_in_chart={this.state.mouse_in_chart}
                        height={this.props.height}
                        chart_height={this.props.chart_height}
                        actual_plot_height={actual_plot_height}
                        keys={this.props.keys}
                        input_datas={this.props.q_data}
                        f_data={this.props.f_data}
                        mouse_date={this.props.mouse_date}
                        y_scale={this.get_y_scale(counts)}
                        q={this.props.q} 
                        f={this.props.f}
                        subcorpus={this.props.subcorpus}
                        x_scale={x_scale}
                        />

    let rectcolor = "grey"
    let strokecolor = "grey"

    if (this.props.mouse_is_dragging){
      rectcolor = "grey"
      strokecolor = "black"
    }


    let headline = ""
    try{
        headline = this.props.all_data[this.props.hover_index]["headline"]
    }catch(e){

    }


    if(this.props.q !== this.props.subcorpus && hide_corpus_on_query){
        corpus_line = ""
    }

    //console.log(this.props.chart_height)

    let plot = <svg
            onMouseMove={e=> this.handle_mouse_move(e.pageX)}
            width={this.state.width - this.props.y_axis_width}
            overflow="visible"
            height={this.props.chart_height + 14}> {/* +14 to get the tube to hit x-axis */}
            {corpus_line}
            {q_line}
            {f_line}
            {tolltiptube}
            </svg>


    if((this.state.width - this.props.y_axis_width) < 0){
        plot = ""
    }

    return (
        <div onMouseLeave={() => this.setState({"mouse_in_chart": true})}  
             onMouseEnter={() => this.setState({"mouse_in_chart": false})}
             onMouseMove={() => this.setState({"mouse_in_chart": false})}
             ref="chart_panel"
             style={{"width": "100%"}}>
        <div id="chart_div" style={{"width": "100%"}} ref={this.myInput}>


          {/*   y axis area */}
          <div style={{"width": "100%", "height": this.props.height - this.props.x_axis_height, float: "left"}}>

              {/*  the y-axis goes here */}
              <div style={{"width": this.props.y_axis_width, "border":"0px solid blue", "height": actual_plot_height - this.props.x_axis_height, "float":"left"}}> 
                  {y_axis}
              </div>

              {/*  main chart here */}
              <div id="main_chart" style={{"width": actual_plot_width, "border":"0px solid red", "height": this.props.height - this.props.x_axis_height, "float":"left"}}>
                {plot}
              </div>

          </div>

          {/*  x axis and main chart here */}
          <div style={{"width": "100%", "height": this.props.x_axis_height, float: "left", "border": "0px solid blue"}}>

                {/*  there is a little padding below where the x axis is */}
                <div style={{"width": this.props.y_axis_width -1 ,  
                             "border":"0px solid green",
                             "float":"left",
                             "height":this.props.x_axis_height}}>
                
                </div>

                {/*  X-axis here */}
                <div style={{"width": this.state.width - this.props.y_axis_width,
                             "float":"left",
                             "border":"0px solid red", 
                             "height":this.props.x_axis_height}}>
                {x_axis}
                </div>

          </div>

        </div>

        </div>

    );
  }
}
