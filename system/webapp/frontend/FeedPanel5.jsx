/*
FeedPanel5.jsx
This one displays actual text
*/

var React = require('react');

import moment from 'moment'
import FeedPanelHLContext from "./FeedPanelHLContext.jsx"
import CollapseButton from "./CollapseButton.jsx"
import MentionDiv from "./MentionDiv.jsx"
import classNames from 'classnames'


function clickHL(ix, feedmode, globals, dt, black_selector_stick_location, q, toggleShow, is_focal){

    if(is_focal){
      console.log("[*] ignoring click on feedpanel as is focal")
      return -1
    }

    let headline = ""
    let pubdate = ""
    try{
      headline = dt['headline']
      pubdate = dt["pubdate"]
    }catch(e){

    }

    toggleShow(headline, pubdate, ix, q, ix, black_selector_stick_location)
  
}

function FeedPanel5 (props: Props){

    let headline = ""
    let nmentions = ""
    let html = ""
    let pubdate = ""
    let pd = ""
    
    let st = props.style

    try {
        headline = props.dt["headline"]
        nmentions = props.dt["nmentions"]
        html = props.mention
        pubdate = props.dt["pubdate"]
        pd = moment(pubdate).format("MMM DD, YYYY")
    } catch (error) {
        return(<div  style={props.style}></div>)
    }

    let is_read = props.checked_off.indexOf(headline) >= 0
    let global_hl = props.globals.map(x => x.headline)
    let is_global = global_hl.indexOf(headline >= 0)


    let collapseButton = <CollapseButton style={props.style} 
                                         index={props.index}
                                         hl={props.hl}
                                         dt={props.dt}
                                         headline={headline}
                                         is_focal={props.is_focal}
                                         is_read={is_read}
                                         is_global={is_global}
                                         handleClose={props.handleClose}
                                         toggleSize={props.toggleSize}
                                         nmentions={props.nmentions}/>

    if(props.feedmode === "global"){
      collapseButton = ""
    }

    let is_hovered = props.is_hovered


    let is_expanded = st.height !== window.itemsize

    let hldiv2 = <FeedPanelHLContext addToGlobals={props.addToGlobals}
                                     all_data_f={props.all_data_f}
                                     black_selector_stick_location={props.black_selector_stick_location}
                                     collapseButton={collapseButton}
                                     checked_off={props.checked_off}
                                     dt={props.dt}
                                     f={props.f}
                                     feedmode={props.feedmode}
                                     is_hovered={is_hovered}
                                     globals={props.globals}
                                     hover_index={props.hover_index}
                                     index={props.index}
                                     is_expanded={is_expanded}
                                     is_focal={props.is_focal}
                                     q={props.q}
                                     remove_global={props.remove_global}
                                     toggleCheckOff={props.toggleCheckOff}
                                     secret_lhs_width={props.secret_lhs_width}
                                     show={props.show}
                                     subcorpus={props.subcorpus}
                                     toggleShow={props.toggleShow}
                                     />

    let mention = <MentionDiv clickMention={props.clickMention}
                                hover_index={props.hover_index}
                                index={props.index}
                                dt={props.dt}
                                globals={props.globals}
                                hover_index={props.hover_index}
                                is_focal={props.is_focal}
                                mention={props.mention}
                                extra_mentions={props.extra_mentions}
                                headline={headline}
                                doc_hl={props.doc_hl}
                                is_read={is_read}
                                is_hovered={is_hovered}
                                style={props.style}
                    />

    let hl_class_name = classNames({"is_focal": props.is_focal}) 


    let className = classNames("feedpanel5",
                              {"is_read": is_read},
                              {"isHoveredIx": props.index === props.hover_index},
                              {"isNotHoveredIx": (!(props.index === props.hover_index))},
                              {"is_focal_light": props.is_focal}
                              )
    
    let bottomHalfClassName = classNames({"is_focal_mention_holder": props.is_focal}) 


    let id = ""
    if(props.index === 91) {
      id = "n1"
    }

    return(<div id={id}
                onMouseEnter={() => props.set_hover_index(props.index)}
                onMouseMove={() => props.set_hover_index(props.index)}
                data-indexnumber={props.index.toString()}
                onClick={() => clickHL(props.index, props.feedmode, 
                                       props.globals, props.dt,
                                       props.black_selector_stick_location, props.q, 
                                       props.toggleShow, props.is_focal)}
                className={className} style={st} >

              <div style={{"border": "0px solid blue"}} className={hl_class_name}>{hldiv2}</div>
              {/* need this weird border thing to get the stuff inside centered correctly */}
              <div  style={{"border": "1px solid red"}}  className={bottomHalfClassName}
                    style={{"width":"100%", "height":st.height - 29}}>
                    {mention}
              </div>
           </div>)

}

function areEqual(prevProps, nextProps) {
  /*
  return true if passing nextProps to render would return
  the same result as passing prevProps to render,
  otherwise return false
  */

  if(!prevProps.style.height === nextProps.style.height){
    return false
  }
  if(!prevProps.hl === nextProps.hl){
    return false
  }
  if(!prevProps.is_hovered === nextProps.is_hovered){
    return false
  }
  if(!prevProps.checked_off === nextProps.checked_off){
    return false
  }
  if(!prevProps.is_focal === nextProps.is_focal){
    return false
  }
  if(!prevProps.f === nextProps.f){
    return false
  }
  if(!prevProps.hover_index === nextProps.hover_index){
    return false
  }
  if(!prevProps.index === nextProps.index){
    return false
  }
  if(!prevProps.doc_hl === nextProps.doc_hl){
    return false
  }

  return true

}
export default React.memo(FeedPanel5, areEqual);
