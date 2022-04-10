var React = require('react');
import moment from 'moment'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import 'tippy.js/themes/light-border.css';


export default class Status extends React.Component{

    render(){

      let numQ = this.props.numQ

      let qsup = <Tippy theme='light-border' delay={600} content={<span>Click to remove the query {this.props.q}</span>}>
                    <sup onClick={() => this.props.removeQ()} style={{'cursor': 'pointer' , 'fontWeight': "bold"}}>X</sup> 
                 </Tippy>


      let news_or_editorials = this.props.section === "news" ? " stories " : " editorials "

      let fsup = <Tippy theme='light-border' delay={600} content={<span>Click to remove the filter {this.props.F}</span>}>
                  <sup onClick={() => this.props.removeFind()} style={{'cursor': 'pointer' , 'fontWeight': "bold"}}>X</sup>
                 </Tippy>

      var height = this.props.height

      if (this.props.q.length === 0 || this.props.loading){
        return(<div style={{"width":"100%", "height":height}}></div>)
      }

      let loading_or_showing = "Viewing "

      let start_phrase = <span style={{"float":"left"}}>{loading_or_showing} {this.props.corpus_count} <em>New York Times</em> {news_or_editorials} with the word {this.props.subcorpus}</span>

      if(this.props.q === this.props.subcorpus){
          return start_phrase
      }

      let filter_phrase = <span>&nbsp;{"and filtering to show "} {this.props.N_filtered_in}</span>

      if(this.props.f.length !== 0){
        if(!this.props.filters_are_on){
            return <span> {start_phrase}{"."}&nbsp;<span> Found {this.props.numQ} mentioning  <span style={{"fontWeight":"bold", "color": window.q_color}}>{this.props.q}</span>{qsup} with {this.props.numF} mentioning <span style={{'fontWeight': "bold", "color": window.f_color}}>{this.props.F}</span>{fsup}</span></span>
        }else{
            return <span>
                        <span> {start_phrase}{"."}&nbsp;<span> Found {this.props.numQ} mentioning  <span style={{"fontWeight":"bold", "color": window.q_color}}>{this.props.q}</span>{qsup} with {this.props.numF} mentioning <span style={{'fontWeight': "bold", "color": window.f_color}}>{this.props.F}</span>{fsup}</span></span>{filter_phrase}
                    </span>
        }
      }else{
        if(!this.props.filters_are_on){ // q, no filter
            return <span style={{"float":"left"}}>{start_phrase}{"."}&nbsp;
                         Found {numQ} mentioning <span style={{"fontWeight":"bold", "color": window.q_color}}>{this.props.q}</span>{qsup}<span>.</span>
                   </span>
        }else{
            return <span style={{"float":"left"}}>{start_phrase}{"."}&nbsp;
                         Found {numQ} mentioning <span style={{"fontWeight":"bold", "color": window.q_color}}>{this.props.q}</span><span></span>{qsup}{filter_phrase}
                   </span>
        }
      }

    }
}
