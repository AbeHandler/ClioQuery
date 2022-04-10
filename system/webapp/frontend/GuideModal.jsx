// @flow
/*
ModalDocR.jsx
*/

var React = require('react');
import Modal from 'react-bootstrap/Modal';
import moment from 'moment'
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';



export default class GuideModal extends React.Component{

    constructor(props) {
        super(props);
        this.state = {"page": 1}
    }

    render() {
        return(<Modal 
              size="lg"
              show={this.props.show}
              onHide={this.props.handleClose}>
              <Modal.Header closeButton>
                      <div>
                      <Modal.Title>
                      TODO
                      </Modal.Title>
                      </div>
              </Modal.Header>
              <Modal.Body>



                  <div style={{"width":"100%"}}>
                  <ButtonGroup aria-label="Basic example">
                    <Button onClick={() => this.setState({"page": this.state.page - 1})} variant="secondary">Prev</Button>
                    <Button onClick={() => this.setState({"page": this.state.page + 1})} variant="secondary">Nexst</Button>
                  </ButtonGroup>  
                  </div>   

                  <p>{this.state.page}</p>

              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.props.handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>)
    }
}