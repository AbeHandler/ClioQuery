/*
HoverSpan.jsx
This one displays actual text
*/

var React = require('react');

export default class HoverSpan extends React.Component{


  constructor(props) {
      super(props);
      this.state = {"dataMentionIx": -1}
  }

  changeColor(html){

      if(html.includes("data-sentence_no")) {
          var parts = html.split(" ")
          for (var i = 0; i < parts.length; i++) {
              if(parts[i].includes("data-mention-index")){
                  let ix = parts[i].split("=")[1].replace(/\"/g, "").toString()
                  let dark_yellow = "rgb(255,215,0)"
                  let selector = '.is_focal_mention_holder > .docviewerholder > span[data-mention-index="' + ix.toString() + '"]'
                  $(selector).css("background-color", dark_yellow)
                  let selector_of_hovered = '.docviewer_grafno > div > div > span > span[data-mention-index="' + ix.toString() + '"]'
                  $(selector_of_hovered).css("background-color", dark_yellow);
              }
          }
      }
  }

  unsetColor(){
      let selector = '.is_focal_mention_holder > .docviewerholder > span.is_read'
      $(selector).css("background-color", "rgb(255, 250, 117)")

      let selector_of_hovered = '.docviewer_grafno > div > div > span > span.docviewermention';
      $(selector_of_hovered).css("background-color", "rgb(255, 250, 117)");
  }

  render() {

    return(<span onMouseLeave={() => this.unsetColor()}
                 onMouseEnter={() => this.changeColor(this.props.html)} 
                 dangerouslySetInnerHTML={{__html: this.props.html}}
                 style={{"fontSize": 12, 'border': "0px solid green"}}/>)

  }
}
