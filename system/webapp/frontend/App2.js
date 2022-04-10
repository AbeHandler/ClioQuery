import React, { useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Feed from './FeedVariable.jsx';
import Status from "./Status.jsx"
import QueryBar from "./QueryBar.jsx";
import NavBar from "./NavBar.jsx";
import FilterBar from "./FilterBar.jsx";
import LoadingChart from "./LoadingChart.jsx";
import Chart from './Chart.jsx';
import GuideModal from "./GuideModal.jsx"
import AboutModal from "./AboutModal.jsx"

import ModalDocInner from "./ModalDocInner.jsx"

import './App.css';
import moment from 'moment' 

import helpers from "./helpers.js"


export default class TemporalLinePlot extends React.Component{


  addToGlobals(hl){

    let pd = this.state.hl2pd[hl]

    let nmentions = this.state.hl2nmentions[hl]

    let globals = this.state.globals

    //if you add or remove a story from globals, it gets marked as unread
    
    console.log('oki29!')
    let checked_off = this.remove_from_checkoff(hl)
    console.log(checked_off)
    this.resetCheckedOff(checked_off)

    if(globals.some(gb => gb.headline === hl)){
       // pass
    }else{
      globals.push({"pubdate": pd,
                    "nmentions": nmentions, 
                    "headline": hl,
                    "q": this.state.q, // the global needs to remember q to communicate w/ backend xross queries
                    "mention": this.state.hl2mentions[hl]})

      //if you add it to globals, remove it from checked off
    }

    const globals_sorted = globals.sort((a, b) => moment(a["pubdate"]).diff(moment(b["pubdate"])))

    this.setState({"globals": globals_sorted})


    var log = {'guid': window.guid, 'globals': globals_sorted, "method": "addToGlobals"}
    this.log_ui(log)

  }

  checkOff(doc_hl){
    let checked_off = this.state.checked_off
    if(checked_off.indexOf(doc_hl) === -1){
      checked_off.push(doc_hl)
    }
    let N_read = checked_off.length
    let N_unread = this.state.all_data.length - N_read
    let log = {"checked_off": checked_off, 
               'N_unread': N_unread,
               'N_read': N_read}
    this.setState(log)
    log['checkOff'] = 'checkOff'
    log['doc_hl'] = doc_hl


    this.log_ui(log)
  }

  clickMention(headline, mention_graph_index, pubdate, index, q){

      this.setState({"mention_graph_index":mention_graph_index})
      var url = "/get_doc?hl=" + headline + "&q=" + this.state.q + "&f=" + this.state.f + "&subcorpus=" + this.state.subcorpus

      $.post(url, (data, status) => this.handle_get_doc(data, status, headline, pubdate, index, q))
      this.toggleShow(headline, pubdate, index, q, index, pubdate)
      this.log_ui({'method': 'clickMention', 'headline': headline})
  }

  countSubCorpus(e){
    $.post("/count_corpus?subcorpus=" + e, function(data, status){
        var url = "/get_doc?hl=" + data['hl'] + "&q=" + this.state.q + "&f=" + this.state.f + "&subcorpus=" + this.state.subcorpus
        var pd = data["pd"]
        this.setState({"corpus_count": data['count']})
      }.bind(this))
  }

  constructor(props) {
    super(props);
    //Notes.
    //convention: -1 == null
    this.state = {}

    this.bottom_half = React.createRef();
    let state = this.get_before_query_state();

    state['corpus_start'] = state['comprehensive_start']
    state['corpus_end'] = state['corpus_end']
    state["forceQtoBlank"] = false
    state["init_bit"] = false // has the corpus been queried?
    state["width"] = 0
    state["section"] = "editorial" 
    state["h"] = 0 
    state["filtered_in"] = []
    state["checked_off"] = []
    state["subcorpus_data"] = []
    state["scroll_depth"] = 0
    state["chart_height"] = 0
    state["bottom_drag_width"] = 0
    state["first_pixel_bottom_half"] = 0
    state["bottom_half_height"] = 0
    state["subcorpus"] = "Salvador"
    state["hl2pd2f"] = {}
    this.state = state
    this.report_qdata(state["subcorpus"])
  }

  getAllBins = function(dates, granularity){
    var all_bins2 = []
    for (var d in dates){
      var m = moment(dates[d]).startOf(granularity).format("YYYY-MM-DD")
      if (all_bins2.indexOf(m) === -1){
        all_bins2.push(m)
      }
    } 
    return all_bins2
  }

  getOKIndexes(newstate){
    let ok_indexes = []

    for (var i = newstate.filter_threshold; i <= 5; i++) {
      ok_indexes.push(i)
    }

    return ok_indexes
  }

  getOKIndexesF(newstate){
    let ok_indexes = []

    for (var i = newstate.filter_threshold_f; i <= 5; i++) {
      ok_indexes.push(i)
    }

    return ok_indexes
  }

  get_before_query_state(){

    let read_state = this.getResetReadState()

    let ou = {
             all_data: [],
             all_data_f: [],
             all_pub_dates: [],
             black_selector_stick_location:-1,
             bottom_left_is_dragging: false,
             chart_mode: "intro",
             chart_bins: [],
             counter: 0,
             comprehensive_end: '20071231',
             comprehensive_start: '19870101',
             doc_pubdate: "",
             docPanel: 0,
             doc_ix: 0,
             doc_hl: "",
             enter_is_filter: false,
             f: "",
             fancy_ix: 0,
             feedmode: "normal",
             filter_threshold: 1,
             hl2size: {},
             loading: true,
             filtered_in: [],
             filtered_in_f: [],
             find_is_focused: false,
             focused_on_q: true,
             force_feed_to_jump: false,
             force_selected_to_empty: false,
             force_y: false,
             globals: [],
             hover_index:-1,
             height: 0,
             hl2extra_mentions: {}, // keep track of extra mentions of HL
             hl2mentions: {},
             hl2mentions_f: {},
             hl: "",
             just_clicked_lhs: false,
             LHS_scrolling: false,
             max_mini_feed_size: 0,
             mention_index: 0,
             mention_graph_index: -1,
             mouse_date: "",
             mouse_down_in_chart: false,
             mouse_is_dragging: false,
             nmentions: 0,
             nmentions_f: 0,
             n_filtered_in_ignore_unread: 0,
             numQ:0,
             N_read:0,
             N_unread:0,
             prelim_f: "",
             q:"",
             q_data: [],
             q_prelim:"",
             query_is_focused:false,
             read_state: read_state,
             scroll_depth: 0,
             scroll_to_this: 0,
             scrolling: false,
             selectedpubdate: "",
             sentences:[],
             show: false,
             show_f: true,
             show_contact: false,
             show_guide_modal: false,
             show_unread_only: false,
             story: "",
             visible_feed_indexes: [],
           }
    return ou
  }

  get_q_data2(hl2pd2, start, end){
      var q_data2 = []

      let s = moment(start).toDate()
      let e = moment(end).toDate()

      var dates = helpers.getDates(s, e);

      let mo_bins = this.getAllBins(dates, "month")
      let yr_bins = this.getAllBins(dates, "year")

      let chart_bins = (this.props.bin_by === "year") ? yr_bins : mo_bins

      if(this.props.bin_by === "year"){
          for (var b in yr_bins){
              q_data2.push(0)
          }
      }else{
          for (var b in mo_bins){
              q_data2.push(0)
          }
      }

      let start_m = moment(start)
      let end_m = moment(end)

      for (var hl in hl2pd2) {
          if(moment(hl2pd2[hl]).isBefore(end_m) && moment(hl2pd2[hl]).isAfter(start_m)){
              let st = ""
              if(this.props.bin_by === "year"){
                  st = moment(hl2pd2[hl]).startOf("year").format("YYYY-MM-DD")
                  let ix = chart_bins.indexOf(st)
                  q_data2[ix] += 1
              }
              if (this.props.bin_by === "month"){
                  st = moment(hl2pd2[hl]).startOf("month").format("YYYY-MM-DD")
                  let ix = chart_bins.indexOf(st)
                  q_data2[ix] += 1
              }
          }
      }

      return {'counts': q_data2, 'bins': chart_bins}
  }

  getBlackSelectorIndex(){
    // get the index of the black selector stick
    var i 
    let pd = moment(this.state.black_selector_stick_location).format("YYYYMMDD")

    if(this.state.black_selector_stick_location === -1){
      return 0 // index is 0
    }

    for (i = 0; i < this.state.filtered_in.length; i++) {
        if(this.state.filtered_in[i]['headline'] === this.state.doc_hl){
            return i
        }
    }

  }

  log_ui(data){
      $.ajax({
            type: "POST", 
            url: "log_ui", //localhost Flask
            data : JSON.stringify(data),
            contentType: "application/json",
        })
  }

  moment2scrollDepth(myMoment){
    let scroll_to_this = 0

    const all_data_s = this.state.filtered_in.sort(window.mySortFunction)

    let all_pub_dates = all_data_s.map((i) => moment(i.pubdate))


    for (var pd in all_pub_dates){
      pd = all_pub_dates[pd]
      if (myMoment <= pd) {
        break
      }else{
        scroll_to_this += 1
      }
    }

    return scroll_to_this
  }

  report_qdata(q){

      if(q.length === 0){
        alert("Sorry. Your query can't be blank")
        return -1
      }

      if(q.split(" ").length > 1){
          alert("Sorry. You can only for single words (no spaces)")
          return -1
      }

      this.setState({"loading": true, "f": "", "q": q})

      $.post("hl2mentions?q=" + q + "&subcorpus=" + this.state.subcorpus + '&init_bit=' + this.state.init_bit, function( data ) {

          var dt = JSON.parse(data)
          var hl2mentions = dt["hl2mentions"]
          var hl2pd2 = dt["hl2pd"]

          let corpus_total = Object.keys(hl2pd2).length

          var all_data = [] // this needs to come 1st to kill the feed. hacking state

          var a = this.get_q_data2(hl2pd2,
                                   this.state.comprehensive_start,
                                   this.state.comprehensive_end)

          var q_data2 = a['counts']

          var chart_bins = a['bins']

          $.ajax({
                type: "POST", 
                url: "get_q_data2" + "?q=" + q + "&subcorpus=" + this.state.subcorpus,
                data : JSON.stringify([]),
                contentType: "application/json",
            }).done(function(e) {

                e = JSON.parse(e)

                let all_data = e["all_data"]
                let hl2nmentions = e["hl2nmentions"]
                let hl2extra_mentions = e["hl2extra_mentions"]
                let numQ = all_data.length
                let d = 0 // document.getElementById('square_status_div').getBoundingClientRect()
                let square_status_top = d.top
                let square_status_bot = d.bottom
                let square_status_height = square_status_bot - square_status_top
                let max_mini_feed_size = square_status_height
                let max_bottom = all_data.length * window.mini_square_size

                if(max_mini_feed_size > max_bottom){
                    max_mini_feed_size = max_bottom
                }

                const all_data_s = all_data.sort(window.mySortFunction)

                let state = this.get_before_query_state();
                state['f'] = ""

                if(q !== this.state.subcorpus){
                    state["comprehensive_start"] = this.state.comprehensive_start
                    state["comprehensive_end"] = this.state.comprehensive_end
                    state['subcorpus_pds'] = this.state.subcorpus_pds
                    state['chart_bins'] = this.state.chart_bins
                }

                state['subcorpus_pds'] = this.state.subcorpus_pds
                state["hl2mentions"] = this.state.hl2mentions
                state["subcorpus"] = this.state.subcorpus // reset the subcorpus
                state["mouse_is_dragging"] = this.state.mouse_is_dragging
                state["hl2nmentions"] = hl2nmentions
                state["q_data"] = q_data2
                state['n_filtered_in_ignore_unread'] = numQ
                state['init_bit'] = true // has the corpus been queried?

                var all_pub_dates = all_data_s.map(x => moment(x["pubdate"]))

                let roundToItemSize = function r2(x){
                          return Math.floor(x/window.mini_square_size)*window.mini_square_size;
                        }

                let minis = roundToItemSize(max_mini_feed_size)

                let hl2size = {}
                let hls = Object.keys(hl2pd2)
                for (var i = 0; i < hls.length; i++) {
                  hl2size[hls[i]] = window.itemsize
                }

                state["q"] = q 
                state["f"] = ""
                state["hl2size"] = hl2size
                state["max_mini_feed_size"] = minis
                state["f_data"] = []
                state["all_data"] = all_data_s
                state["filtered_in"] = all_data_s // after query, everything is filtered in
                state['N_read'] = 0
                state['N_unread'] = all_data_s.length
                state["loading"] = false
                state["all_pub_dates"] = all_pub_dates
                state["focused_on_q"] = true
                state["numQ"] = numQ
                state["square_status_top"] = d.top
                state["square_status_bot"] = d.bottom
                state['square_status_height'] = square_status_height
                state['forceQtoBlank'] = false
                state['hl2extra_mentions'] = hl2extra_mentions
                state["hl2mentions"] = hl2mentions
                state["checked_off"] = []
                state['chart_bins'] = chart_bins
                state['hl2pd'] = hl2pd2
                state["globals"] = [] //globals reset on query

                //set start and end based on Q
                console.log(this.state.subcorpus, q)

                if(this.state.subcorpus === q){
                    let start = moment(all_data_s[0]["pubdate"]).startOf('year').format('YYYYMMDD')
                    let end =  moment(all_data_s[all_data_s.length - 1]["pubdate"]).endOf("year").format('YYYYMMDD')
                    state["comprehensive_start"] = start
                    state["comprehensive_end"] = end
                    state["corpus_start"] = start
                    state["corpus_end"] = end

                    state['subcorpus_pds'] = all_pub_dates
                    state['chart_bins'] = chart_bins

                    var a = this.get_q_data2(hl2pd2, start, end)

                    state['q_data'] = a['counts']
                    state['subcorpus_data'] = a["counts"]
                    state['chart_bins'] = a['bins']

                }

                if(all_data_s.length > 0){

                  let headline2 = all_data_s[0]['headline']
                  let pubdate2 = all_data_s[0]["pubdate"]
                  let ix2 = 0
                  let q2 = state["q"]
                  let f2 = state["f"]
                  var url = "/get_doc?hl=" + headline2 + "&q=" + q2 + "&f=" + f2 + "&subcorpus=" + this.state.subcorpus + "&init_bit=" + this.state.init_bit
                                                                  //data, status, headline, pubdate, ix, q
                  
                  $.post(url, (data, status) => this.handle_get_doc(data, status, headline2, pubdate2, ix2, q2))
                }

                this.countSubCorpus(this.state.subcorpus)
                state["chart_mode"] = "intro"
                state['f'] = ""
                state['f_data'] =[]
                state['numF'] =0
                state['all_data_f'] = []
                state['filter_threshold_f'] = 0
                state['filtered_in_f'] = []
                state['hl2mentions_f'] = {}
                state["black_selector_stick_location"] = -1

                this.setState(state)
                
        }.bind(this));

      }.bind(this));

  }

  report_q(q){
    this.setState({"q_prelim": q, "focused_on_q": true})
  }



  mouse_move_in_chart(p){

    let day = moment(p).dayOfYear()

    let m = moment(p).startOf('year');

    if(day > (365/2)){
        m.add(369, 'days'); // round up to nearest year

        //went too far
        if(m > moment(this.state.comprehensive_end)){
            m = moment(p).startOf('year');
        }

    }else{
        // round down
    }

    m = m.startOf('year').format("YYYY-MM-DD")

    
    this.setState({"scrolling": false,
                  "LHS_scrolling": false,
                  "mouse_date":m});

    if(this.state.all_data.length <= 0){
      console.log("ending early, mouse_move_in_chart. No data loaded")
      return -1 // skip
    }else{

    }

    let highest_possible = moment(this.state.all_data[this.state.all_data.length -1]["pubdate"])

    let lowest_possible = moment(this.state.all_data[0]["pubdate"])

    let mouse_location = moment(p)

    let black_selector_stick_location

    if (mouse_location > highest_possible) {
       black_selector_stick_location = highest_possible.format("YYYY-MM-DD")
    } else {
       //black_selector_stick_location = mouse_location.format("YYYY-MM-DD")
    }

    if (mouse_location < lowest_possible) {
       if(this.state.chart_mode !== "intro"){
          //you get a weird bug if you mouse out before intro mode where it chooses lowest one
          black_selector_stick_location = lowest_possible.format("YYYY-MM-DD")
       }
    }

    if (this.state.mouse_is_dragging){
      this.setState({black_selector_stick_location: black_selector_stick_location});
    }
  }

  computeSizes(){

      let width = 1200 // TODO clear

      let chart_height = width / this.props.width_to_height_ratio;

      let h = chart_height + this.props.x_axis_height;

      const full_height = document.getElementById('full').clientHeight;

      const secret_lhs_width = document.getElementById('secret_doc_LHS').clientWidth;

      const bottom_drag_width = 0 // document.getElementById('square_status_div').clientWidth;

      // 60 == query height 
      // 15 == status height
      // 60 == filter bar height
      // 40 == nav bar height
      const bottom_half = full_height - h - 60 - 15 - 60 - window.nav_height

      const first_pixel_bottom_half = full_height - bottom_half

      this.countSubCorpus(this.state.subcorpus)

      if (width < 0){
        width = 0
      }

      this.setState({"width": width,
                     "h": h,
                     "scroll_depth": 0,
                     "secret_lhs_width": secret_lhs_width,
                     "chart_height":chart_height,
                     "bottom_drag_width": bottom_drag_width,
                     "first_pixel_bottom_half": first_pixel_bottom_half,
                     "bottom_half_height": bottom_half});
  }


  componentDidMount() {
      this.setState({"loading": true})
      this.computeSizes()
      window.addEventListener('resize', function(){this.computeSizes()}.bind(this)) // 
  }


  killScroll(){
      this.setState({"scrolling": false, "hover_index": -1})
  }



  dedupe_and_sort(before_dedupe){
    //TODO dupe code... search for deduped
    let hl_so_far = []
    let deduped = []
    for (var i = 0; i < before_dedupe.length; i++) {
        if(hl_so_far.indexOf(before_dedupe[i]["headline"] === -1)){
          deduped.push(before_dedupe[i])
          hl_so_far.push(before_dedupe[i]["headline"])
        }
    }

    return deduped.sort((a, b) => moment(a["pubdate"]).diff(moment(b["pubdate"])))

  }

  resetDocAfterFilter(filtered_in){

    // You have just queried for F. But the first doc may or may not have included F. 
    // So you need to reset the doc based on F. But not necessarily display the first doc showing F
    if(filtered_in.length > 0){
          let headline2 = filtered_in[0]['headline']
          let pubdate2 = filtered_in[0]["pubdate"]
          let ix2 = 0
          let q2 = this.state.q
          let f2 = this.state.f
          var url = "/get_doc?hl=" + headline2 + "&q=" + q2 + "&f=" + f2 + "&subcorpus=" + this.state.subcorpus
          $.post(url, (data, status) => this.handle_get_doc(data, status, headline2, pubdate2, ix2, q2))
    }
  }

  handle_get_doc(data, status, headline, pubdate, ix, q){
      var doc = data["doc"]

      var all_mentions = data['all_mentions']


      let hl2extra_mentions = this.state.hl2extra_mentions

      hl2extra_mentions[headline] = all_mentions

      var paragraphs = data['paragraphs']

      var grafs = paragraphs.filter(graf => graf.raw.length > 0);

      //https://stackoverflow.com/questions/986937/how-can-i-get-the-browsers-scrollbar-sizes
      function getScrollBarWidth () {
          var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
              widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
          $outer.remove();
          return 100 - widthWithScroll;
      };

      let scrollbarwidth = getScrollBarWidth()

      let modal_doc_inner_w = $("#doc_viewer").width() - 30 - scrollbarwidth// -30 for padding in ModalDocInner - scrollbar width


      $("#secret_doc_LHS_inner").html("")
      $("#secret_doc_LHS_inner").css("width", modal_doc_inner_w)
      $("#secret_doc_LHS_inner").css("display", "block")
      $("#secret_doc_LHS_inner").css("overflow", "auto")

      let graf_sizes = {}

      $.each(grafs, function (i, doc) {
           let w = $("#secret_doc_LHS_inner").append("<div id='graf" + i + "'>" + doc + "</div>")
           let h = $("#graf" + i).height()
           let extra_line = 16 * 1.5 //i.e. font size * line height
           graf_sizes[i] = h
           $("#secret_doc_LHS_inner").css('height', 'auto')
          }.bind(this))

      let newstate = {"show": true,
                      "doc_hl": headline, 
                      "doc_pubdate": pubdate,
                      "doc_nmentions": data["nmentions_q"],
                      "doc_nmentionsf": data["nmentions_f"],
                      "doc_ix": ix,
                      "docPanel": ix,
                      "pubdate": pubdate,
                      "modal_q": q,
                      "grafs": grafs,
                      "graf_sizes": graf_sizes,
                      "hl2extra_mentions": hl2extra_mentions,
                      "nmentions_f": data["nmentions_f"],
                      "sentences": all_mentions,
                      "nmentions": data["nmentions_q"],
                      "story": doc}

      this.log_ui(newstate)

      // reset visible indexes b/c once get doc changes the feed likely changes. 
      // by now the feed is settled
      this.setState(newstate, this.resetVisibleFeedIndexes())
  }

  handleClickOnDocHeader(headline, pubdate, ix, q){

    // not that q must be fed to this function b/c the query might have changed for globals.

    var f = this.state.f

    var url = "/get_doc?hl=" + headline + "&q=" + q + "&f=" + f + "&subcorpus=" + this.state.subcorpus

    this.setState({"hl": headline, 
                   "black_selector_stick_location": moment(pubdate).format("YYYYMMDD")})

    $.post(url, (data, status) => this.handle_get_doc(data, status, headline, pubdate, ix, q))

  }

  get_filtered_in_by_read(filtered_in){

    // filtered in HL gets set before read/unread filtering
    let filtered_in_hl = filtered_in.map((x) => x.headline) 

    let checked_off_hl = this.state.checked_off // checked off is a HL list

    let global_hls = this.state.globals.map(x => x["headline"])


    let isRead = x => {return global_hls.indexOf(x.headline) === -1 && checked_off_hl.indexOf(x.headline) !== -1}

    let isNotRead = x => {return global_hls.indexOf(x.headline) === -1 && checked_off_hl.indexOf(x.headline) === -1}

    let isBookmarked = x => {return global_hls.indexOf(x.headline) !== -1}

    let read = filtered_in.filter(isRead)
    let unread = filtered_in.filter(isNotRead)
    let bookmarked = filtered_in.filter(isBookmarked)

    /*console.log("**")
    console.log(read)
    console.log(unread)
    console.log(bookmarked)*/

    let ou = []

    if(this.state.read_state.has("read")) {
      ou = ou.concat(read)
    }

    if(this.state.read_state.has("unread")){
      ou = ou.concat(unread)
    }

    if(this.state.read_state.has("bookmarked")){
      ou = ou.concat(bookmarked)
    }

    const ou_s = ou.sort(window.mySortFunction)

    return {"N_read": read.length, "N_unread": unread.length, "filtered_in": ou_s}
  }

  hide_includes_f(e){
      console.log("hide_includes_f")
      this.setState({'show_f': false}, this.masterFilter)
  }

  get_within_dates(some_data, start, end){
    let filtered_in = some_data

    if(start !== -1){
      let m_s = moment(start)
      filtered_in = filtered_in.filter((i) => moment(i["pubdate"]).isSameOrAfter(m_s))
    }

    if(end !== -1){
      let m_e = moment(end)
      filtered_in = filtered_in.filter((i) => moment(i["pubdate"]).isSameOrBefore(m_e))
    }

    return(filtered_in)
  }

  get_visible_feed_indexes(){
      /* return indexes in the feed that are visible */
      let feed_y_top = $("#the_feed").get(0).getBoundingClientRect().top
      let feed_y_bottom = $("#the_feed").get(0).getBoundingClientRect().bottom

      let visible_feed_indexes = []

      $('.feedpanelhlcontext').each(function(i,j){
          let top = j.getBoundingClientRect().top
          let bottom = j.getBoundingClientRect().bottom
          let indexnumber = $(j).data('indexnumber')
          let headline = $(j).data('headline')
          let tolerance = 7 // how many pixels tolerance to give to the top rule? 

          top += tolerance
          bottom -= tolerance

          if(top >= feed_y_top && bottom <= feed_y_bottom){
            visible_feed_indexes.push(indexnumber)
          }
      })

      visible_feed_indexes.sort()

      return visible_feed_indexes
  }

  getExtraMentions(i){
    //load extra mentions on demand

    let headline = this.state.filtered_in[i]["headline"]

    console.log("ok2")

    $.post("/get_doc?hl=" + headline + "&q=" + this.state.q + "&f=" + this.state.f + "&subcorpus=" + this.state.subcorpus, function(data, status){
        var doc = data["doc"]
        var all_mentions = data['all_mentions']

        let hl2extra_mentions = this.state.hl2extra_mentions

        hl2extra_mentions[headline] = all_mentions

        console.log(hl2extra_mentions[headline])

        this.setState({"hl2extra_mentions": hl2extra_mentions})

      }.bind(this))

  }


  handleReportSlider(e){
      this.log_ui({'method': 'handleReportSlider', 'filter_threshold': e})
      this.setState({"filter_threshold": e}, this.masterFilter)
  }


  handleReportSliderf(e){
      this.log_ui({'method': 'filter_threshold_f', 'filter_threshold_f': e})
      this.setState({"filter_threshold_f": e}, this.masterFilter)
  }

  keyMoves(key, e){

      let sd = -1

      let all_data_len = this.state.all_data.length

      console.log(key, e)

      if (key === "space"){
        sd = this.state.scroll_to_this + 1;
        if (sd < all_data_len){
            this.setState({"scroll_to_this": sd})
        }
      }
      if (key === "down"){
        sd = this.state.scroll_to_this + 1;
        if (sd < all_data_len - 1 ){
            this.setState({"scroll_to_this": sd})
        }
      }
      if (key === "shift+space"){
        sd = this.state.scroll_to_this - 1;
        if (sd >= 0){
            this.setState({"scroll_to_this": sd})
        }
      }
      if (key === "up"){
        sd = this.state.scroll_to_this - 1;
        if (sd >= 0){
            this.setState({"scroll_to_this": sd})
        }
      }

      if (key === "enter"){

        console.log(this.state.query_is_focused, this.state.find_is_focused)

        if(this.state.query_is_focused){
            this.report_qdata(this.state.q_prelim)
        }else if(this.state.find_is_focused){
            this.setFind(this.state.prelim_f)
        }else{
            //
        }
      }

      if(sd !== -1){
        this.setState({"scrolling":false,
                       "black_selector_stick_location":moment(this.state.all_data[sd]["pubdate"]).format("YYYY-MM-DD")})
      }
  }

  get_within_relevance(all_data){
    //Relevance filtering
    let ok_indexes = this.getOKIndexes(this.state)
    let filtered_in = all_data.filter((i) => ok_indexes.indexOf(this.simplifyNMentions(i.nmentions)) !== -1)
    return filtered_in
  }

  get_within_relevance_f(all_data){
    let ok_indexes = this.getOKIndexesF(this.state)
    let filtered_in = all_data.filter((i) => ok_indexes.indexOf(this.simplifyNMentions(i.nmentionsf)) !== -1)
    return filtered_in
  }

  masterFilterHelper(input_data){

    let filtered_in = this.get_within_relevance(input_data)


    if(this.state.f.length > 0){
        filtered_in = this.get_within_relevance_f(filtered_in)
    }

    //Time filtering
    filtered_in = this.get_within_dates(filtered_in, this.state.comprehensive_start, this.state.comprehensive_end)

    filtered_in = filtered_in.sort(window.mySortFunction)

    //filter by read. This also returns N_read/N_unread
    let ou = this.get_filtered_in_by_read(filtered_in)
    ou["scroll_to_this"] = 0
    ou['black_selector_stick_location'] = -1


    return ou
  }

  masterFilter(){

    let ou = this.masterFilterHelper(this.state.all_data)
    this.setState(ou, this.resetDocAfterFilter(ou.filtered_in))

  }

  reportScrollDepth(full_data, rowSizes) {

    if(this.state.LHS_scrolling){
      console.log("ignoring, lhs is scrolling")
      return -1 // dont use this method if LHS is scrolling
    }

    if(this.state.filtered_in.length === 0){
      console.log("[*] filtered_in is 0")
      return -1
    }

    var scrolling = this.state.scrolling;

    if(this.props.chart_mode === undefined && this.state.scroll_to_this == 0){
        ///not sure what causes this. Sometimes the scroll does not work on init
        // fl > 2 to avoid immediately jumping to the first item in the feed
        scrolling = true
    }

    let force_feed_to_jump = false
    if (scrolling){

        //if you want the feed to trigger an update to focal date, use this condition
        let feed_triggers_update_to_focal_date = false

        let visible_feed_indexes = this.get_visible_feed_indexes()

        let middle = visible_feed_indexes[Math.round(visible_feed_indexes.length/2)]

        let scroll_to_this = middle

        if(Math.abs(scroll_to_this, this.state.scroll_to_this) > 5){
          //user just did a huge scroll. Kill scrolling.
          // this will cause the feeed to jump so that the big scroll location is 
          // at the center of the feed 
          force_feed_to_jump = true
        }

        let newstate = {
                        scrolling: scrolling,
                        scroll_to_this: scroll_to_this,
                        force_y: false,
                        force_feed_to_jump: force_feed_to_jump,
                        just_clicked_lhs: false,
                        LHS_scrolling: false,
                        'visible_feed_indexes': visible_feed_indexes,
                        'chart_mode':"rectangle"}


        this.setState(newstate)

        //prevents flashing on small scrolls
        if(this.state.scroll_to_this !== scroll_to_this){
            this.setState(newstate)
            newstate["guid"] = window.guid
            newstate["method"] = "reportScrollDepth"
            this.log_ui(newstate)
        }else{
            console.log("new scrol")
        }

    }else{
        console.log("not scrolling")
    }
  }

  report_click_on_callout(e){

    let pubdate = moment(e["pubdate"]).format("YYYY-MM-DD")
    let headline = e["headline"]

    let end = moment(e["pubdate"])

    let scroll_to_this = this.moment2scrollDepth(end)

    var url = "/get_doc?hl=" + headline + "&q=" + this.state.q + "&f=" + this.state.f + "&subcorpus=" + this.state.subcorpus

    $.post(url, (data, status) => this.handle_get_doc(data, status, headline, pubdate, scroll_to_this, this.state.q))

    let checked_off = this.state.checked_off
    checked_off.push(headline)
    this.resetCheckedOff(checked_off)

    let ou = {mouse_down_in_chart: false, 
              mouse_is_dragging: false,
              'scrolling': false,
              'checked_off': checked_off,
              "LHS_scrolling": false,
              chart_mode:"rectangle",
              'method': 'report_click_on_callout',
              "black_selector_stick_location": pubdate}

    this.log_ui(ou)

    this.setState(ou, () => this.set_scroll(scroll_to_this) )
  }


  remove_global(e){

    let globals = this.state.globals
    let new_globals = []

    for (var g in globals){
       if(globals[g]["headline"] !== e){
          new_globals.push(globals[g])
       }
    }

    let co = this.state.checked_off
    co.push(e)
    
    this.resetCheckedOff(co)

    this.setState({"global_all_data": new_globals,
                   "globals": new_globals})

  }

  removeQ(e){

    let new_q = ""
    let forceQtoBlank = true
    let q = ''

    if(this.state.f.length > 0){
        new_q = this.state.f
        forceQtoBlank = false
        q = new_q
    }else{
        new_q = this.state.subcorpus
    }

    this.setState({"forceQtoBlank": forceQtoBlank,
                   "q": q,
                   "loading": true,
                   "q_data": [],
                   "f": ""})

    this.removeFind()
    this.report_qdata(new_q)

  }

  resetHLSize(headline, new_size){
    let new_state = JSON.parse(JSON.stringify(this.state.hl2size))
    new_state[headline] = new_size
    let ou = {"hl2size": new_state, "method": "resetHLSize", 'guid': window.guid}
    this.setState(ou)
    this.log_ui(ou)
  }

  removeFind(word){

    this.setState({"chart_mode":"intro",
                   'f': "",
                   'f_data':[],
                   'numF':0,
                   'all_data_f': [],
                   'filter_threshold_f': 0,
                   'filtered_in_f': [],
                   'hl2mentions_f': {},
                   "black_selector_stick_location": -1, 
                   scroll_to_this: 0},
                      () => {  // reset the doc viewer
                          let ou = this.masterFilterHelper(this.state.all_data)
                          console.log("setting to 2", ou["filtered_in"])
                          this.setState({"filtered_in": ou["filtered_in"]}, 
                            () => {
                                if(ou['filtered_in'].length > 0){
                                      let headline2 = ou['filtered_in'][0]['headline']
                                      let pubdate2 = ou['filtered_in'][0]["pubdate"]
                                      let ix2 = 0
                                      let q2 = this.state.q
                                      let f2 = ""
                                      var url = "/get_doc?hl=" + headline2 + "&q=" + q2 + "&f=" + f2 + "&subcorpus=" + this.state.subcorpus

                                      $.post(url, (data, status) => this.handle_get_doc(data, status, headline2, pubdate2, ix2, q2))
                                }
                            }
                          )
                     }
                  )
  }

  resetVisibleFeedIndexes(){
    let visible_feed_indexes = this.get_visible_feed_indexes()
    console.log("resetting visible indexes")
    this.setState({'visible_feed_indexes': visible_feed_indexes})
  }

  setFocalDateLHS(ix, e){

    let d = new Date()
    this.setState({"scroll_to_this": ix, 'LHS_scrolling': true})
      
  }

  set_scroll(scroll_to_this){

    this.setState({"scroll_to_this": scroll_to_this})

  }

  setGlobalFeed(){

      var all_data = []
      var all_pub_dates = []

      this.state.globals.forEach(function (value) {
          value["pubdate"] = value["pubdate"]
          all_pub_dates.push(value["pubdate"])
          all_data.push(value)
      });

      this.setState({'scroll_to_this': -1,
                     "black_selector_stick_location": -1,
                     "feedmode": "global", 
                     'filtered_in': this.state.all_data,
                     "global_pub_dates": all_pub_dates,
                     "global_all_data": all_data}, 
                     this.resetDocAfterFilter(all_data))
  }

  setNmentionsF(all_data_f, headline){
      let hl2nmentionsf = {}
      for (var i = 0; i < all_data_f.length; i++) {
         let headline = all_data_f[i]['headline']
         let nmentionsf = all_data_f[i]['nmentions_f']
         hl2nmentionsf[headline] = nmentionsf
      }

      let f_headlines = all_data_f.map((x) => x["headline"])

      //reset nmentionsf to 0
      let all_data2 = JSON.parse(JSON.stringify(this.state.all_data))
      for (var i = all_data2.length - 1; i >= 0; i--) {
        all_data2[i]['nmentionsf'] = 0
        if(f_headlines.indexOf(all_data2[i]['headline']) !== -1){
            all_data2[i]['nmentionsf'] =  hl2nmentionsf[all_data2[i]['headline']] 
        }else{
            all_data2[i]['nmentionsf'] = 0
        }
      }

      return(all_data2)
  }

  hl2nmentionsf(all_data2, headline){
    let doc_nmentionsf = 0
    for (var i = all_data2.length - 1; i >= 0; i--) {
        if(all_data2[i]["headline"] === headline){
            doc_nmentionsf = this.state.all_data[i]["nmentionsf"]
        }
    }
    return doc_nmentions
  }

  setFind(word){

    if(this.state.q === this.state.subcorpus){
      alert('You must enter a query before you can use the Filter by subquery feature')
      return - 1
    }

    if(this.state.q === word.toLowerCase()){
      alert('Your subquery must be different from the query')
      return - 1
    }

    if(this.state.q.length === 0){
      alert('You must enter a query before you can use the Filter by subquery feature')
      return - 1
    }

    if (word === ''){
        this.setState({"chart_mode":"intro",
                       'f': word,
                       "black_selector_stick_location": -1, 
                       scroll_to_this: -1})
    }
    else if(word.split(" ").length > 1){
      alert("sorry. you can only filter by one word right now")
    }
    else{
        this.setState({"filter_threshold": 0}, () => {
            $.post("/query_filtered?f=" + word + '&q=' + this.state.q + "&subcorpus=" + this.state.subcorpus, function(data, status){
              data = JSON.parse(data)

              var all_data_f = []
              var all_pub_dates = []
              let hl2mentions_f = this.state.hl2mentions_f 
              let hl2nmentions = this.state.hl2nmentions
              let hl2pd2f = {}

              if(data.length === 0){
                 alert("No documents with " + this.state.q + " also contain " + word)
                 return -1
              }


              $.each(data, function( index, item ) {
                                    all_data_f.push(item)
                                    all_pub_dates.push(moment(item["pubdate"]))
                                    hl2pd2f[item["headline"]] = item["pubdate"]
                                    hl2nmentions[item["headline"]] = item["nmentions"]
                                    hl2mentions_f[item["headline"]] = item['mention']

              }.bind(this))

              let all_data2 = this.setNmentionsF(all_data_f)

              let f_data = this.get_q_data2(hl2pd2f, this.state.comprehensive_start, this.state.comprehensive_end)["counts"]

              let all_data_filtered  = this.masterFilterHelper(all_data2)

              let filtered_in_s = all_data_filtered["filtered_in"].sort(window.mySortFunction)

              // You have just queried for F. But the first doc may or may not have included F. 
              // So you need to reset the doc based on F. But not necessarily display the first doc showing F
              if(filtered_in_s.length > 0){
                    let headline2 = filtered_in_s[0]['headline']
                    let pubdate2 = filtered_in_s[0]["pubdate"]
                    let ix2 = 0
                    let q2 = this.state.q
                    let f2 = word
                    var url = "/get_doc?hl=" + headline2 + "&q=" + q2 + "&f=" + f2 + "&subcorpus=" + this.state.subcorpus

                    $.post(url, (data, status) => this.handle_get_doc(data, status, headline2, pubdate2, ix2, q2))
              }

              this.setState({"chart_mode":"intro",
                             'f': word,
                             'numF': data.length,
                             'f_data': f_data,
                             'hl2pd2f': hl2pd2f,
                             'filtered_in': filtered_in_s,
                             'all_data': all_data2,
                             'all_data_f': all_data_f,
                             'prelim_f': "",
                             'filter_threshold_f': 0,
                             'enter_is_filter': false,
                             'hl2mentions_f': hl2mentions_f,
                             "black_selector_stick_location": -1, 
                             scroll_to_this: -1})
          }.bind(this))
        })
    }
  }

  //TODO
  show_includes_f(e){

    let filtered_in = this.state.filtered_in
    let f_headlines = this.state.all_data_f.map((a) => a["headline"])
    let filtered_in_f = this.state.all_data.filter((i) => f_headlines.indexOf(i.headline) >= 0)

      
    let before_dedupe = filtered_in.concat(filtered_in_f) // add the ones that have f

    let deduped = this.dedupe_and_sort(before_dedupe)

    deduped = this.get_within_dates(deduped, this.state.comprehensive_start, this.state.comprehensive_end)


    let newstate = {'scroll_to_this': -1,
                   'black_selector_stick_location': -1,
                   'reset_feed_sizes': true,
                   'method': 'show_includes_f',
                   'show_unread_only': false,
                   'start': this.state.comprehensive_start,
                   'end': this.state.comprehensive_end,
                   'filtered_in': deduped}
    this.log_ui(newstate)
    this.setState(newstate, this.resetDocAfterFilter(deduped))

  }

  show_not_includes_f(e){

    let filtered_in = this.state.filtered_in
    let f_headlines = this.state.all_data_f.map((a) => a["headline"])
    let filtered_in_f = this.state.all_data.filter((i) => f_headlines.indexOf(i.headline) === -1)
    
    let before_dedupe = filtered_in.concat(filtered_in_f) // add the ones that have f

    let deduped = this.dedupe_and_sort(before_dedupe)

    deduped = this.get_within_dates(deduped, this.state.comprehensive_start, this.state.comprehensive_end)

    let newstate = {'scroll_to_this': -1,
                   'black_selector_stick_location': -1,
                   'reset_feed_sizes': true,
                   'show_unread_only': false,
                   'method':'show_not_includes_f',
                   'start': this.state.comprehensive_start,
                   'end': this.state.comprehensive_end,
                   'filtered_in': deduped}

    this.setState(newstate, this.resetDocAfterFilter(deduped))
    this.log_ui(newstate)

  }

  setSubcorpus(e){
      let st = this.get_before_query_state()
      st["loading"] = true;
      st["forceQtoBlank"] = true;
      this.setState(st, () => this.countSubCorpus(e))

      if(e === "Nicaragua" || e === "Salvador"){

          this.setState({"section": "news"})
      }else{
          this.setState({"section": "editorial"})
      }

      this.setState({"q": e, "subcorpus": e, "init_bit": false}, () => this.report_qdata(e))
  }

  setReadState(toggled){
      let read_state = this.state.read_state 

      if(read_state.has(toggled)){
        read_state.delete(toggled)
      }else{
        read_state.add(toggled)
      }

      this.setState({'read_state': read_state}, 
      this.masterFilter)
  }

  simplifyNMentions(n){
    if(n >= 5){
      return 5
    }else{
      return n
    }
  }

  getResetReadState(){
    let read_state = new Set()

    read_state.add("read")  
    read_state.add("unread")  
    read_state.add("bookmarked")  
    return read_state
  }

  toggleTimeFilter(what_to_change, date_to_change_it_to){
    let start = this.state.comprehensive_start
    let end = this.state.comprehensive_end


    //this resets the filters, for sanity's sake
    this.setState({'scroll_to_this': -1,
                   'reset_feed_sizes': true,
                   "black_selector_stick_location":-1,
                   "chart_mode":"intro",
                   'read_state': this.getResetReadState(), // set read state to all
                   "black_selector_stick_location": -1
                 }); 

    if(what_to_change === "comprehensive_start"){
        start = date_to_change_it_to
        this.setState({"comprehensive_start": start})
    }else{
        start = this.state.comprehensive_start
    }

    if(what_to_change === "comprehensive_end"){
        end = date_to_change_it_to
        this.setState({"comprehensive_end": end})
    }else{
        end = this.state.comprehensive_end
    }

    this.setState({"comprehensive_start": start,  
                   "comprehensive_end": end}, function(){

                          let ou = this.masterFilterHelper(this.state.all_data)
                          let filtered_in = ou["filtered_in"]

                          var a = this.get_q_data2(this.state.hl2pd,
                                                   start,
                                                   end)
                          

                          ou['q_data'] = a['counts']
                          ou['chart_bins'] = a['bins']

                          ou["f_data"] = this.get_q_data2(this.state.hl2pd2f, 
                                                          start,
                                                          end)["counts"]


                          ou['method'] = 'toggleTimeFilter'
                          ou['reset_feed_sizes'] = true
                          ou['show_unread_only'] = false

                          //update subcorpus data also
                          if(this.props.q === this.props.subcorpus){
                            ou["subcorpus_data"] = a['counts']
                          }

                          this.log_ui(ou)
                          this.setState(ou, this.masterFilter)
                   }
                )
  }

  remove_from_checkoff(doc_hl){
    let checked_off = this.state.checked_off
    let index = checked_off.indexOf(doc_hl)
    if(index === -1){
        return checked_off
    }else{
        checked_off.splice(index, 1)
        return checked_off
    }
  }

  resetCheckedOff(checked_off){

    this.setState({"checked_off": checked_off}, function(){
                    let ou = this.masterFilterHelper(this.state.all_data); 
                    this.setState({'N_read': ou["N_read"], 
                                   "N_unread": ou["N_unread"]})
                  })

  }

  toggleCheckOff(doc_hl){
    let checked_off = this.state.checked_off

    if(checked_off.indexOf(doc_hl) === -1){
      checked_off.push(doc_hl)
    }else{
      checked_off = this.remove_from_checkoff(doc_hl)
    }
    this.resetCheckedOff(checked_off).bind(this)
    this.remove_global(checked_off)

  }

  toggleShow(headline, pubdate, ix, q, index, black_selector_stick_location){

    // not that q must be fed to this function b/c the query might have changed for globals.

    var f = this.state.f

    var url = "/get_doc?hl=" + headline + "&q=" + q + "&f=" + f + "&subcorpus=" + this.state.subcorpus

    //this.setState({ "black_selector_stick_location": moment(pubdate).format("YYYY-MM-DD")})

    $.post(url, (data, status) => this.handle_get_doc(data, status, headline, pubdate, ix, q))

    this.checkOff(headline)

    let newstate = this.masterFilterHelper(this.state.all_data)

    let returned = this.state.all_data.filter((x) => x["headline"] === headline)[0]

    let filtered_in = newstate.filtered_in

    let filter_in_hl = filtered_in.map((x) => x["headline"])

    if(filter_in_hl.indexOf(headline) === -1){ // add it back in if was not in before
      filtered_in.push(returned)
    }

    const filtered_in_s = filtered_in.sort(window.mySortFunction)

    newstate['filtered_in'] = filtered_in_s

    newstate['black_selector_stick_location'] = moment(pubdate).format("YYYY-MM-DD")

    newstate['method'] = 'toggleShow'

    this.log_ui(newstate)

    this.setState(newstate)

  }

  filters_are_on(){
    //has the user turned on any filters?
    if(this.state.f.length == 0){
      return this.state.filtered_in.length != this.state.all_data.length
    }else{
      return this.state.filtered_in.length != this.state.all_data.length
    } 
  }

  unsetGlobalFeed(){
      this.setState({'scroll_to_this': -1,
                     'legend_threshold': 1,
                     'black_selector_stick_location': -1,
                     "feedmode": "normal"},
                     this.resetDocAfterFilter(this.state.all_data))
  }

  render() {

      let chart = ""

      let doc_hl

      if(this.state.h > 5){
        chart = <Chart
                 all_data={this.state.filtered_in}
                 all_data_f={this.state.all_data_f}
                 black_selector_stick_location={this.state.black_selector_stick_location}
                 chart_height={this.state.chart_height}
                 chart_mode={this.state.chart_mode}
                 checked_off={this.state.checked_off}
                 comprehensive_end={this.state.comprehensive_end}
                 comprehensive_start={this.state.comprehensive_start}
                 doc_hl={this.state.doc_hl}
                 f={this.state.f}
                 f_data={this.state.f_data}
                 feedmode={this.state.feedmode}
                 globals={this.state.globals}
                 height={this.state.h}
                 hover_index={this.state.hover_index}
                 keys={this.state.chart_bins}
                 mouse_date={this.state.mouse_date}
                 mouse_is_dragging={this.state.mouse_is_dragging}
                 mouse_move_in_chart={this.mouse_move_in_chart.bind(this)}
                 numQ={this.state.numQ}
                 q={this.state.q}
                 q_data={this.state.q_data}
                 report_click_on_callout={(e) => this.report_click_on_callout(e)}
                 scroll_depth={this.state.scroll_depth}
                 scroll_to_this={this.state.scroll_to_this}
                 scrolled={this.state.all_data[this.state.scroll_to_this]}
                 scrolling={this.state.scrolling}
                 subcorpus={this.state.subcorpus}
                 subcorpus_data={this.state.subcorpus_data}
                 subcorpus_pds={this.state.subcorpus_pds}
                 width_to_height_ratio={this.props.width_to_height_ratio}
                 x_axis_height = {this.props.x_axis_height}
                 y_axis_width={55}/>

       }


    let filters_are_on = this.filters_are_on()

    let status = <Status 
                         all_data={this.state.all_data}
                         f={this.state.f}
                         F={this.state.f}
                         bottom_half_height={this.state.bottom_half_height}
                         corpus_count={this.state.corpus_count}
                         filter_threshold={this.state.filter_threshold}
                         filtered_in={this.state.filtered_in}
                         N_filtered_in={this.state.filtered_in.length}
                         filters_are_on={filters_are_on}
                         height={25} 
                         section={this.state.section}
                         loading={this.state.loading}
                         subcorpus={this.state.subcorpus}
                         numF={this.state.numF}
                         numQ={this.state.numQ}
                         prelim_f={this.state.prelim_f}
                         q={this.state.q}
                         read_state={this.state.read_state}
                         removeFind={this.removeFind.bind(this)}
                         removeQ={this.removeQ.bind(this)}
                         />

    let all_data

    if(this.state.feedmode === "global"){
        all_data = this.state.global_all_data
    }else{
        all_data = this.state.all_data
    }


    let inner_feed = <Feed 
                          addToGlobals = {this.addToGlobals.bind(this)}
                          all_data={this.state.filtered_in}
                          filtered_in={this.state.filtered_in}
                          all_data_f = {this.state.all_data_f}
                          black_selector_stick_location = {this.state.black_selector_stick_location}
                          bottom_left_is_dragging = {this.state.bottom_left_is_dragging}
                          chart_mode={this.state.chart_mode}
                          checked_off={this.state.checked_off}
                          clickMention = {this.clickMention.bind(this)}
                          container_height={this.state.bottom_half_height}
                          doc_hl={this.state.doc_hl}
                          f = {this.state.f}
                          feedmode={this.state.feedmode}
                          filter_threshold={this.state.filter_threshold}
                          force_feed_to_jump={this.state.force_feed_to_jump}
                          getExtraMentions={this.getExtraMentions.bind(this)}
                          globals={this.state.globals}
                          hover_index={this.state.hover_index}
                          hl = {this.state.hl}
                          hl2extra_mentions={this.state.hl2extra_mentions}
                          hl2mentions={this.state.hl2mentions}
                          hl2mentions_f = {this.state.hl2mentions_f}
                          hl2nmentions={this.state.hl2nmentions}
                          hl2size = {this.state.hl2size}
                          in_feed={this.state.bottom_half_height/window.itemsize}
                          initScroll = {()=> this.setState({"scrolling": true, 'LHS_scrolling': false})}
                          just_clicked_lhs={this.state.just_clicked_lhs}
                          killScroll = {this.killScroll.bind(this)}
                          LHS_scrolling={this.state.LHS_scrolling}
                          mention_graph_index = {this.state.mention_graph_index}
                          q = {this.state.q}
                          reportScrollDepth = {this.reportScrollDepth.bind(this)} 
                          toggleCheckOff = {this.toggleCheckOff.bind(this)}
                          resetVisibleFeedIndexes={this.resetVisibleFeedIndexes.bind(this)}
                          remove_global={this.remove_global.bind(this)}
                          resetHLSize={this.resetHLSize.bind(this)}
                          scroll_depth = {this.state.scroll_depth}
                          scroll_to_this = {this.state.scroll_to_this}
                          scrolling = {this.state.scrolling}
                          secret_lhs_width={this.state.secret_lhs_width}
                          set_hover_index={(e) => this.setState({"hover_index": e})}
                          subcorpus = {this.state.subcorpus}
                          show={this.state.show}
                          toggleShow={this.toggleShow.bind(this)}
                          />

    let wide_feed = <Col style={{"border": ".1px solid lightgrey","padding":"0px"}} sm={11}>{inner_feed}</Col> 

    let filter_bar = <FilterBar
                       N_read={this.state.N_read}
                       N_unread={this.state.N_unread}
                       all_data_f={this.state.all_data_f}
                       all_data_length={this.state.all_data.length}
                       checked_off={this.state.checked_off}
                       clear_force_selected={() => this.setState({force_selected_to_empty: false})}
                       comprehensive_end={this.state.comprehensive_end}
                       comprehensive_start={this.state.comprehensive_start}
                       f={this.state.f}
                       f_data={this.state.f_data}
                       feedmode={this.state.feedmode}
                       filter_threshold={this.state.filter_threshold}
                       filter_threshold_f={this.state.filter_threshold_f}
                       filtered_in={this.state.filtered_in}
                       filtered_in_f={this.state.filtered_in_f}
                       force_selected_to_empty={this.state.force_selected_to_empty}
                       globals={this.state.globals}
                       height={40}
                       hide_includes_f={this.hide_includes_f.bind(this)}
                       loading={this.state.loading}
                       n_filtered_in_ignore_unread={this.state.n_filtered_in_ignore_unread}
                       numQ={this.state.numQ}
                       q={this.state.q}
                       read_state={this.state.read_state}
                       removeFind={this.removeFind.bind(this)}
                       reportSlider={this.handleReportSlider.bind(this)}
                       reportSliderf={this.handleReportSliderf.bind(this)}
                       setFind={this.setFind.bind(this)}
                       setFindIsFocused={()=>this.setState({"find_is_focused": true, "query_is_focused": false})}
                       setGlobalFeed={this.setGlobalFeed.bind(this)}
                       setReadState={this.setReadState.bind(this)}
                       setComprehensiveEnd={(e) => {this.toggleTimeFilter("comprehensive_end", moment(e).format("YYYYMMDD"))}}
                       setComprehensiveStart={(e) => {this.toggleTimeFilter("comprehensive_start", moment(e).format("YYYYMMDD"))}} 
                       
                       show_includes_f={this.show_includes_f.bind(this)}
                       show_not_includes_f={this.show_not_includes_f.bind(this)}
                       show_unread_only={this.state.show_unread_only}
                       subcorpus={this.state.subcorpus}
                       turn_on_enter_is_filter = {() => this.setState({"enter_is_filter": true}) }
                       unsetFindIsFocused={()=>this.setState({"find_is_focused": false, "query_is_focused": false})}
                       unsetGlobalFeed={this.unsetGlobalFeed.bind(this)} 
                       />

    let fancy_hl = ""

    try{
      fancy_hl = this.state.all_data[this.state.fancy_ix]["headline"]
    }catch(e){
      //
    }

    let square_status = ""

    let container_color = "1px solid #ededed"                                

    if(this.state.loading){
        wide_feed = ""
        square_status = ""
        container_color = "1px solid white" 
        chart = < LoadingChart height={this.state.h} />
    }

    if (this.state.q === ""){
        wide_feed = ""
        feed_minimap = ""
        filter_bar = ""
        square_status = ""
    }                  

    let mini_map_border = (!this.state.show || this.state.loading) ? "white": "lightgrey" 

    let feed_minimap = ""


    let right = wide_feed 
    let left = feed_minimap

    let black_selector_index = this.getBlackSelectorIndex()

    //console.log("1", this.state.doc_nmentionsf)

    if(this.state.show){

      right = <Col sm={6} id="doc_viewer" style={{"border": ".1px solid lightgrey",
                                                  "marginTop": window.labelspace,
                                                  "padding": 0,
                                                  "height":this.state.bottom_half_height - window.labelspace}}>
                   <ModalDocInner 
                      addToGlobals={this.addToGlobals.bind(this)}
                      all_data_f={this.state.all_data_f}
                      black_selector_stick_location={this.state.black_selector_stick_location}
                      checked_off={this.state.checked_off}
                      container_height={this.state.bottom_half_height - window.labelspace}
                      doc_hl={this.state.doc_hl}
                      doc_nmentions={this.state.doc_nmentions}
                      doc_nmentionsf={this.state.doc_nmentionsf}
                      doc_pubdate={this.state.doc_pubdate}
                      doc_ix={this.state.doc_ix}
                      dt={this.state.filtered_in[black_selector_index]}
                      f={this.state.f}
                      globals={this.state.globals}
                      graf_sizes={this.state.graf_sizes}
                      grafs={this.state.filtered_in.length > 0 ? this.state.grafs: []}
                      hover_index={this.state.hover_index}
                      mention_graph_index={this.state.mention_graph_index}
                      mention_index={this.state.mention_index}
                      modal_q={this.state.modal_q}
                      nmentions={this.state.nmentions}
                      nmentions_f={this.state.nmentions_f}
                      panelNo={this.state.docPanel}
                      pubdate={this.state.pubdate}
                      q={this.state.q}
                      remove_global={this.remove_global.bind(this)}
                      toggleCheckOff={this.toggleCheckOff.bind(this)}
                      sentences={this.state.sentences}
                      set_scroll={(e) => this.setState({"scrolling": false, "scroll_to_this": e})}
                      show={this.state.show}
                      style={{"height": 20}}
                      subcorpus={this.state.subcorpus}
                      total_filtered_in={this.state.filtered_in.length}
                      handleClickOnDocHeader={this.handleClickOnDocHeader.bind(this)}
                      width={this.state.clientWidth}
                  />
              </Col>

      let feedheight = this.state.bottom_half_height - window.labelspace

      left  =   <>
                {feed_minimap}
                <Col sm={6} id="feed_smaller" style={{"borderBottom": "1px solid lightgrey", 
                                                      "paddingLeft": 0,
                                                      "paddingRight": 7,
                                                      "marginTop": window.labelspace,
                                                      "height":feedheight }}>
                    <div style={{"height":window.labelheight,
                              "fontWeight":"bold",
                              "backgroundColor": window.querybarcolor,
                              "border": "1px solid black",
                              "paddingLeft": 7,
                              "paddingTop": 2,
                              "width": "100%"}}>Document Feed</div>
                    {inner_feed}
                </Col>
                </>
    }

    let secret_width = this.state.secret_lhs_width - 20
    let invisible = (!this.state.show || this.state.loading) ? "invisible": "visible" 


    return(<div id="full" className="full">
                
                <div id="secretDiv" style={{"border":"1px solid black", "width":"100%",  "position":"absolute", "top":"-1000010px"}}>
                   <Container style={{"height":this.state.bottom_half_height}}>
                        <Row  style={{"height":this.state.bottom_half_height}} id="secret_feed_holder">
                            <Col sm={6} id="secret_doc_viewer" style={{"padding": 0,"height": this.props.container_height}}></Col>
                            <Col sm={6} id="secret_doc_LHS" style={{"padding": 0, "height":this.state.bottom_half_height}}>
                                  <div style={{"width": "100%"}}>
                                    <div style={{"width":"17px", "float":"left"}}></div>
                                   
                                  </div>
                            </Col>
                        </Row>
                    </Container> 
                </div>

                <div id="secretDiv" style={{"border":"1px solid black", "width":"100%",  "position":"absolute", "top":"-1000225px"}}>
                     <div style={{"border":"1px solid black", "width": secret_width, "lineHeight":1.5,  "fontSize":12, "float":"left"}} id="secret_doc_LHS_inner"></div>
                </div>

            <NavBar setSubcorpus={(e) => this.setSubcorpus(e)}
                    globals={this.state.globals}
                    checked_off={this.state.checked_off}
                    filtered_in={this.state.filtered_in}
                    q={this.state.q}
                    f={this.state.f}
                    show_contact={() => this.setState({"show_contact": true})} />

            <QueryBar 
                      comprehensive_start={this.state.comprehensive_start}
                      comprehensive_end={this.state.comprehensive_end}
                      corpus_start={this.state.corpus_start}
                      corpus_end={this.state.corpus_end}
                      setComprehensiveEnd={(e) => {this.toggleTimeFilter("comprehensive_end", moment(e).format("YYYYMMDD"))}}
                      setComprehensiveStart={(e) => {this.toggleTimeFilter("comprehensive_start", moment(e).format("YYYYMMDD"))}}   
                      subcorpus={this.state.subcorpus}
                      setSubcorpus={(e) => this.setSubcorpus(e)}
                      report_q={this.report_q.bind(this)} 
                      report_qdata={this.report_qdata.bind(this)}
                      f={this.state.f}
                      q={this.state.q}
                      init_bit={this.state.init_bit}
                      setFind={this.setFind.bind(this)}
                      removeQ={this.removeQ.bind(this)}
                      removeFind={this.removeFind.bind(this)}
                      find_is_focused={this.state.find_is_focused}
                      setFindIsFocused={()=>this.setState({"find_is_focused": true, "query_is_focused": false})}
                      unsetFindIsFocused={()=>this.setState({"find_is_focused": false, "query_is_focused": false})}
                      q_data={this.state.q_data}
                      setSection={(e) => this.setState({"section": e})}
                      loading={this.state.loading}
                      turnOnFocus={() => this.setState({"find_is_focused": false, "query_is_focused": true})}
                      turnOffFocus={() => this.setState({"find_is_focused": false, "query_is_focused": false})}
                      turn_off_enter_is_filter={() => this.setState({"enter_is_filter": false})}
                      subcorpus={this.state.subcorpus}
                      forceQtoBlank={this.state.forceQtoBlank}
                      set_prelim_f={(e) => this.setState({'prelim_f': e})}
                      show_guide_modal={() => this.setState({"show_guide_modal": true})}
                      show_contact={() => this.setState({"show_contact": true})}
                      height={60}/>
            
            <AboutModal handleClose={() => this.setState({"show_contact": false})} show={this.state.show_contact}/>

            <GuideModal handleClose={() => this.setState({"show_guide_modal": false})} show={this.state.show_guide_modal}/>

              <Container>
                  <Row id="status">
                    <div style={{'width':'100%'}}>
                     {status}
                    </div>
                  </Row>
              </Container>

            <div id="top-half" style={{"margin": "auto"}}>

              <Row id="chart_row" >
              <Container style={{"borderBottom": container_color}}>
                {chart} 
                </Container>
              </Row>

            </div>

            <div style={{"height":40}}>
                {filter_bar}
            </div>


            <div className={invisible} ref={this.bottom_half} id="bottom-half" style={{"height":this.state.bottom_half_height}}>
              <Container style={{"height":this.state.bottom_half_height}}>
                  <Row  style={{"overflow":"hidden",
                                "height":this.state.bottom_half_height}} id="feed_holder">
                      {left}
                      {right}
                  </Row>
              </Container>
            </div>

          </div>);
  }
}
