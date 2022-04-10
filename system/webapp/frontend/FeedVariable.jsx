import React, { useState } from 'react';
import { memo } from 'react';
import FeedPanel5 from "./FeedPanel5.jsx"
import { VariableSizeList as List, areEqual } from 'react-window';
import moment from 'moment'

var ReactDOM = require('react-dom');

export default class Feed extends React.Component {
    constructor(props) {
      super(props);
      console.log("[*] Feed variable constructor")
      this.listRef = React.createRef();

      this.state = {"counter": 0}
    }

    componentDidMount(){
        this.nameInput.focus();
  
        //sometime the component is remounted
        try{
          let where_to_scroll = this.props.scroll_to_this > 0 ? "center": "start"
          this.listRef.current.scrollToItem(this.props.scroll_to_this, where_to_scroll);
        }catch(e){
          console.log(e)
        }
    }

    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):

      if (!this.props.scrolling) {
        if(this.props.scroll_to_this !== prevProps.scroll_to_this){
            try{
              //note on top, the feed panel pushes all of the items + 100
              let where_to_scroll = "start" 
              if(this.props.LHS_scrolling && !this.props.just_clicked_lhs){
                where_to_scroll = "center"
                // set a little delay otherwise it loads & reloads
                // So say LHS scrolls 100 px. there will be maybe 3 scroll reports at 33, 66, 100 px and the RHS will jump 3X. annoying
                // So this delay is to avoid those double jumps
                setTimeout(() => {console.log(this.props.scroll_to_this)
                                  this.listRef.current.scrollToItem(this.props.scroll_to_this, where_to_scroll);
                                  this.bustCache()}, 100);
              }else{
                this.listRef.current.scrollToItem(this.props.scroll_to_this, where_to_scroll);
                this.bustCache()
              }

            }catch(e){
              console.log(e)
              console.log(this.props.scroll_to_this)
            }
        }
      }

      if(this.props.all_data.length != prevProps.all_data.length){

          console.log("[*] data length changed (e.g. filter or requery). Resetting feed sizes. Scrolling to 0.")
          this.listRef.current.scrollToItem(0, "start");
          this.bustCache()
      }

      if(Object.values(prevProps.hl2size).length > 0 && Object.values(this.props.hl2size).length > 0){
          let current_hl = Object.values(this.props.hl2size)
          let prev_hl = Object.values(prevProps.hl2size)
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          let current_sum = current_hl.reduce(reducer)
          let next_sum = prev_hl.reduce(reducer)

          //bust cache if feed panel sizes have changed
          if(current_sum !== next_sum){
              this.bustCache()
          }
      }


    }

    sende(e, rowSizes){
      /* 
      if you dont have this check then on mouseup the dropped date 
      will jump the feed will report a scroll
      */

      if(this.props.scrolling){
          this.props.reportScrollDepth(e, rowSizes) 
      }

      // no matter what, reset those visible indexes onScroll
      this.props.resetVisibleFeedIndexes() 

    }

    get_nmentions(props, index){
        var headline = props.all_data[index]['headline']
        return props.hl2nmentions[headline]
    }

    bustCache(){
      if (this.listRef.current) {
          console.log("[*] Breaking the cache in FeedVariable")
          this.listRef.current.resetAfterIndex(0);
        }else{
          console.log("bad", this.listRef)
        }
    }

    //https://codesandbox.io/s/kmzrylpx7o?file=/index.js:887-897
    //resizable list
    toggleSize(i){
        
        this.props.getExtraMentions(i)
        let hl_context_height = 40 // the height of HL context is 35 px

        let big_size = (window.itemsize * .4) * this.get_nmentions(this.props, i) + hl_context_height
        let small_size = window.itemsize

        let headline = this.props.all_data[i]["headline"]

        let current_size = this.props.hl2size[headline]
        let new_size

        if(current_size === big_size){
             new_size = small_size
        }else{
            new_size = big_size
        }

        this.props.resetHLSize(headline, new_size)

      };


    rowMap(props){

          var get_mention = function (hl2mentions, hl2mentions_f, f, globals, index, feedmode, headline) {
              //not that some hl2mentions_f will be unfilled if F does not occur
              let f_keys = Object.keys(hl2mentions_f)
              if(feedmode === "global"){
                try{
                    return globals[index]['mention']
                }catch(e){
                    return {__html: ""}
                }
                
              }
              if(f.length > 0 && f_keys.indexOf(headline) >= 0){
                return hl2mentions_f[headline]
              }else{
                return hl2mentions[headline]
              }
          }


          let headline = this.props.all_data[props.index]["headline"]

          let mention = get_mention(this.props.hl2mentions, 
                                    this.props.hl2mentions_f,
                                    this.props.f,
                                    this.props.globals,
                                    props.index,
                                    this.props.feedmode,
                                    headline)
          
          let dt = this.props.all_data[props.index]

          if(this.props.feedmode === "global"){
            dt = this.props.globals[props.index]
          }


          return(<FeedPanel5
                   addToGlobals={this.props.addToGlobals}
                   all_data_f={this.props.all_data_f}
                   black_selector_stick_location={this.props.black_selector_stick_location}
                   checked_off={this.props.checked_off}
                   clickMention={this.props.clickMention}
                   doc_hl={this.props.doc_hl}
                   dt={dt}
                   extra_mentions={this.props.hl2extra_mentions[headline]}
                   f={this.props.f}
                   feedmode={this.props.feedmode}
                   globals={this.props.globals}
                   handleClose={this.props.handleClose}
                   hover_index={this.props.hover_index}
                   hl={this.props.hl}
                   is_hovered={props.index === this.props.hover_index}
                   is_focal={dt["headline"] === this.props.doc_hl && this.props.black_selector_stick_location !== -1}
                   just_clicked_lhs={this.props.just_clicked_lhs}
                   nmentions = {this.props.hl2nmentions[headline]}
                   mention = {mention}
                   q={this.props.q}
                   remove_global={this.props.remove_global}
                   toggleCheckOff={this.props.toggleCheckOff}
                   scrolling={this.props.scrolling}
                   secret_lhs_width={this.props.secret_lhs_width}
                   set_hover_index={this.props.set_hover_index}
                   show={this.props.show}
                   start_pd = {moment(this.props.all_data[0]["pubdate"]).format("YYYY-MM-DD")}
                   subcorpus = {this.props.subcorpus}
                   toggleShow={this.props.toggleShow}
                   toggleSize={this.toggleSize.bind(this)} 
                   {...props}
                   />)
    }

    getRowSize(i){
      let hl = this.props.all_data[i]["headline"]
      return this.props.hl2size[hl]
    }

    render() {

      //console.log(this.props.all_data)

      const divStyle = {
        width:this.props.width,
        padding:"0px",
        height: this.props.container_height.toString() + "px",
        overflowY: 'hidden',
        "position": "relative"
      }

      let inner = ""

      let itemCount = (this.props.feedmode === "global") ? this.props.globals.length : this.props.all_data.length

      let h = this.props.container_height - window.labelheight + 3

      let newlist = <List
                      ref={this.listRef}
                      onScroll={(e) => this.sende(e, this.props.hl2size)} 
                      height={h}
                      itemCount={itemCount}
                      itemSize={this.getRowSize.bind(this)}
                      width={this.props.width}
                      useIsScrolling
                    >
                      {this.rowMap.bind(this)}
                    </List>


      divStyle["height"] = h

      return(<div ref={(input) => { this.nameInput = input; }} 
                  id="the_feed"
                  
                  onMouseLeave={() => this.props.killScroll()}
                  onMouseMove={() => this.props.initScroll()}
                  onMouseEnter={()=> this.props.initScroll()}
                  style={divStyle}>
                  {newlist}
              </div>
             );
    }
}
