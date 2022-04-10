// @flow
/*
SimpleMention.jsx
*/

var React = require('react');

var $ = require('jquery')

export default class SimpleMention extends React.Component{

    constructor(props) {
      super(props);
      this.state = {'hovered': false}
    }

    shouldComponentUpdate(nextProps, nextState) {
      if(this.props.headline !== nextProps.headline){
        return true
      }
      if(this.props.doc_hl !== nextProps.doc_hl){
        return true
      }
      if(this.props.focal !== nextProps.focal){
        return true
      }
      if(this.state.hovered !== nextState.hovered){
        return true
      }
       if(this.props.is_read !== nextProps.is_read){
        return true
      }
      return false
    }


    render(){

          let snippet = {"__html": this.props.snippet}

          let backgroundColor1 = "white"

          let active = this.props.doc_hl === this.props.headline


          if(this.props.focal && active){
              backgroundColor1 = 'rgb(255,250,117)'
          }
          

          if(this.state.hovered  && this.props.focal && active){
              backgroundColor1 = "rgb(255,215,0)"

              //var numItems = $('.real > .docviewermention').length
              //console.log(this.props.sentence_no, this.props.grafno)
              //console.log(".real > [data-mention-index=" + this.props.mention_index.toString() + "]")
              //a real hack here. A better version would be to split the paragraphs into mentions and non-memtnions and push a list of spans

              //need to go by sentence_no b/c the first mention might not by the first sentence
              //for instance, the first snippet might be most relational
              //console.log(".real > [data-sentence_no=" + this.props.sentence_no.toString() + "]")

              $(".docviewermention[data-sentence_no=" + this.props.sentence_no.toString() + "]").css("background-color", backgroundColor1)

          }else{
              $(".docviewermention[data-sentence_no=" + this.props.sentence_no.toString() + "]").css("background-color", 'rgb(255,250,117)')
          }

          let st = {
                    "overflow":"hidden", 
                    "marginLeft":15, 
                    "height": window.itemsize * .4,
                    "fontSize": 12, 
                    "border": "0px solid green",
                    "color": "#696969",
                    "width":"95%"}

          let className = ""

          let is_global = false

          for (var value of this.props.globals) {
            if(value["headline"] === this.props.headline){
                st["marginLeft"] = 0
                st["position"] = "relative"
                is_global = true 
            }
          }

          st["float"] = 'right'

          if(this.props.is_read){
             className = "is_read"
          }

          if(this.props.is_read && !this.props.focal && !is_global){
             className = "is_read is_read_not_focal"
          }

          let st2 = {}
          if(backgroundColor1 !== "white"){
            st2["backgroundColor"] = backgroundColor1
          }

          if(this.props.is_read && !this.props.is_focal){
              st2["color"] = window.readcolor
          }

          if(this.props.focal || is_global){
              st2["color"] = "black"
          }

          st2["cursor"] = "pointer"

          let inner = <span key={this.props.headline + "inn34" + this.props.mention_index.toString()}
                        data-mention-index={this.props.mention_index}
                        onMouseOver={() => this.setState({"hovered": true})}
                        key={this.props.headline + "mention" + this.props.mention_index.toString()}            
                        onClick={(e) => this.props.clickMention(this.props.headline, this.props.grafno, this.props.pubdate, this.props.index, this.props.q)}
                        className={className}
                        style={st2}
                        dangerouslySetInnerHTML={snippet}></span> 


          return(<div className="docviewerholder"
                      key={this.props.headline + "outler" + this.props.mention_index.toString()} 
                      style={st} >
                  {inner}
                 </div>)
    }
}

