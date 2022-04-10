// @flow
/*
ModalDocR.jsx
*/

var React = require('react');
import Modal from 'react-bootstrap/Modal';
import moment from 'moment'
import Button from 'react-bootstrap/Button';



export default function AboutModal(props){

    return(<Modal 
          size="lg"
          show={props.show}
          onHide={props.handleClose}>
          <Modal.Header closeButton>
                  <Modal.Title>
                  Contact Information
                  </Modal.Title>
          </Modal.Header>
          <Modal.Body>


              <p>This software was developed at the <a href="https://www.cics.umass.edu/">College of Information and Computer Sciences</a> to help
                 social scientists investigate time-based queries in digital news corpora.
              </p>

              <p>Contact <a href="http://www.abehandler.com/">Abe Handler</a> with any questions or comments.</p>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={props.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>)
}


