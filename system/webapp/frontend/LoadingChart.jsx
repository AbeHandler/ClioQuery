"use strict";
import React from 'react';


export default class LoadingChart extends React.Component{

    render(){
            return (<div style={{"height":this.props.height}}>
                        <img className="rounded mx-auto d-block" 
                             src="https://s3-us-west-2.amazonaws.com/www.abehandler.com/bucket_settings/Spinner-1s-200px.gif"/>
                    </div>)
    }
}