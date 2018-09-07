import React from 'react';
import {
    Button,
    Input,
    Form, FormGroup, Label, Col, Jumbotron, Container, ModalFooter, ModalBody, ModalHeader, Modal,
} from 'reactstrap';
import Center from 'react-center';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BeatLoader} from "react-spinners";

const errorMessage = <text>Something went wrong...</text>;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stationName: '',
            isLoading: false,
            errorMessage: '',
            value: '',
            modal: false,
            error: false,

        };
    };

    toggle = () => {
        this.setState({
            modal: !this.state.modal
        });
    };

    getTimetable = () => {
        const url = this.urlForFirstQuery(this.state.value);
        this.executeQueries(url);
    };

    urlForFirstQuery = (stationName) => {
        const data = {
            app_id: '4f50fb10',
            app_key: '51c2a121a93df56435901bb8030c72d7',
        };
        const queryString = Object.keys(data)
            .map(key => key + '=' + encodeURIComponent(data[key]))
            .join('&');

        return 'https://api.tfl.gov.uk/StopPoint/Search/' + encodeURIComponent(stationName) + '?' + queryString;
    };

    urlForSecondQuery = (stationID) => {
        const data = {
            app_id: '4f50fb10',
            app_key: '51c2a121a93df56435901bb8030c72d7',
        };
        const queryString = Object.keys(data)
            .map(key => key + '=' + encodeURIComponent(data[key]))
            .join('&');

        return `https://api.tfl.gov.uk/StopPoint/${stationID}/Arrivals` + '?' + queryString;
    };


    executeQueries = (query) => {

        this.setState({isLoading: true});
        fetch(query)
            .then(response => response.json())
            .then((responseJson) => {
                let stationID='';
                    responseJson.matches.find((item) => {
                       if (item.name.toLowerCase() === this.state.value.toLowerCase())  {
                           stationID = item.id;
                       }
                    });
                    this.setState(
                        {
                            stationID: stationID,
                        }
                    );
                }
            )
            .catch(error =>
                this.setState(
                    {
                        isLoading: false,
                        errorMessage: 'Something went wrong...' + error,
                        error: true,
                    }
                )
            )
            .then(() => {
                    fetch(this.urlForSecondQuery(this.state.stationID))
                        .then(response => response.json())
                        .then((responseJson) => {
                            let timeToStation = [];
                            let destinationName = [];
                            for (let i = 0 ; i < responseJson.length; i++){
                                timeToStation[i] = Math.floor(responseJson[i].timeToStation / 60);
                                destinationName[i] = responseJson[i].destinationName;
                            }
                            let minTimeToStation = timeToStation[0];
                            let index;
                            for (let i = 1; i < timeToStation.length; ++i) {
                                if (timeToStation[i] < minTimeToStation) {
                                    minTimeToStation = timeToStation[i];
                                    index = i;
                                }
                            }
                            let minDestinationName = destinationName[index];

                            this.setState({
                                timeToStation: minTimeToStation,
                                destinationName: minDestinationName,
                                });
                            this.setState({isLoading: false});
                            this.toggle();
                            }
                        )
                        .catch(error =>
                            this.setState(
                                {
                                    isLoading: false,
                                    errorMessage: 'Something went wrong...' + error,
                                    error: true,
                                }
                            )
                        );
                }
            );
    };

    render() {
        const showMessage = this.state.error ? errorMessage : (<text>Next arrival in {this.state.timeToStation} mins destination {this.state.destinationName}</text>);
        return (
            <Col>
                <Jumbotron className="insideJum" style={{backgroundColor: 'lavender'}}>
                    <Container>
                        <Form>
                            <FormGroup>
                                <Label for="exampleText"
                                       style={{color: 'black'}}>
                                    <h3>Enter the station name:</h3></Label>
                                <Input type="textArea" name="text" id="exampleText" onChange={(event) => {
                                    this.setState({value: event.target.value})
                                }} value={this.state.value}/>
                            </FormGroup>
                            <br/>
                            <Button color="secondary" onClick={e => {
                                e.preventDefault();
                                this.getTimetable();
                            }}>Expected arrival</Button>
                            <br/>
                        </Form>
                    </Container>
                </Jumbotron>
                <Center>
                    <BeatLoader color={'mediumPurple'}
                                loading={this.state.isLoading} />
                </Center>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Expected arrival</ModalHeader>
                    <ModalBody>
                        {showMessage}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>OK</Button>
                    </ModalFooter>
                </Modal>
            </Col>
        )
    }
}

export default App;
