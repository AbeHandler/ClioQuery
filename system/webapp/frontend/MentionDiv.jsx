// @flow
/*
MentionDiv.jsx
*/

var React = require('react');
import SimpleMention from "./SimpleMention.jsx"


function make_mention_div(html, mention_index, headline, focal, doc_hl, 
                          is_read, clickMention, hover_index, pubdate,
                          index, globals, grafno, sentence_no){


      return <SimpleMention html={html}
                            key={mention_index + headline + "pinkPanda3330"}
                            clickMention={clickMention}
                            mention_index={mention_index}
                            headline={headline}
                            hover_index={hover_index}
                            globals={globals}
                            is_read={is_read}
                            doc_hl={doc_hl}
                            panel_index={index}
                            pubdate={pubdate}
                            snippet={html['snippet']}
                            sentence_no={sentence_no}
                            grafno={grafno}
                            focal={focal} />
}

function MentionDiv (props: Props){

    let mention =  make_mention_div(props.mention,
                                    0, 
                                    props.headline,
                                    props.is_focal, 
                                    props.doc_hl,
                                    props.is_read,
                                    props.clickMention,
                                    props.hover_index,
                                    props.dt.pubdate,
                                    props.index,
                                    props.globals,
                                    props.mention.grafno,
                                    props.mention.sentence_no)

    // the second condition is a fix to a bug. The first condition will fire on the last panel in the feed
    // which has some padding added to allow scroll past the final item in the list.
    if(props.style.height > window.itemsize && props.extra_mentions.length > 0 ){ // the user wants to see all mentions in the story
        let extra_mentions = props.extra_mentions

        mention = extra_mentions.map((i, j) => make_mention_div(i, 
                                                                j,
                                                                props.headline,
                                                                props.is_focal,
                                                                props.doc_hl,
                                                                props.is_read,
                                                                props.clickMention,
                                                                props.hover_index,
                                                                props.dt.pubdate,
                                                                props.index,
                                                                props.globals,
                                                                i.grafno,
                                                                i.sentence_no
                                                                ))
    }

    return (mention)
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
  if(!prevProps.extra_mentions.length === nextProps.extra_mentions.length){
    return false
  }
  if(!prevProps.headline === nextProps.headline){
    return false
  }
  if(!prevProps.is_focal === nextProps.is_focal){
    return false
  }
  if(!prevProps.doc_hl === nextProps.doc_hl){
    return false
  }
  if(!prevProps.index === nextProps.index){
    return false
  }
  if(!prevProps.hover_index === nextProps.hover_index){
    return false
  }
  if(!prevProps.globals.length === nextProps.globals.length){
    return false
  }
  return true
}

export default React.memo(MentionDiv, areEqual);
