import React, { Component } from 'react';
import MyToken from './contracts/MyToken.json';
import MyTokenSale from './contracts/MyTokenSale.json';
import KycContract from './contracts/KycContract.json';
import getWeb3 from './getWeb3';
import {
  Container,
  Row,
  Col,
  InputGroup,
  InputGroupAddon,
  Input,
  Button,
  Card,
  CardText,
  CardBody,
  CardTitle,
} from 'reactstrap';

import './App.css';

class App extends Component {
  state = {
    loaded: false,
    kycAddress: '0x123',
    tokenSaleAddress: '',
    userTokens: 0,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      //this.networkId = await this.web3.eth.getChainId();

      this.myToken = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] &&
          MyToken.networks[this.networkId].address
      );

      this.myTokenSale = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] &&
          MyTokenSale.networks[this.networkId].address
      );

      this.kycContract = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] &&
          KycContract.networks[this.networkId].address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.setState(
        { loaded: true, tokenSaleAddress: this.myTokenSale.options.address },
        this.updateUserTokens
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    console.log(value);
    this.setState({
      [name]: value,
    });
    //console.log(kycAddress);
    //console.log(this.kycContract.options.address);
  };

  handleKycSubmit = async () => {
    const { kycAddress } = this.state;
    //console.log(kycAddress);
    await this.kycContract.methods
      .setKycCompleted(kycAddress)
      .send({ from: this.accounts[0], gas: 300000 });
    alert('Account ' + kycAddress + ' is now whitelisted');
  };

  handleBuyToken = async (amount) => {
    await this.myTokenSale.methods
      .buyTokens(this.accounts[0])
      .send({ from: this.accounts[0], value: amount });
  };

  updateUserTokens = async () => {
    let userTokens = await this.myToken.methods
      .balanceOf(this.accounts[0])
      .call();
    this.setState({ userTokens: userTokens });
  };

  listenToTokenTransfer = async () => {
    this.myToken.events
      .Transfer({ to: this.accounts[0] })
      .on('data', this.updateUserTokens);
  };

  render() {
    if (!this.state.loaded) {
      return (
        <div>
          Loading Web3, accounts, and contract...You must have Metamask and
          switch to Rinkeby network
        </div>
      );
    }
    return (
      <Container>
        <div className="App">
          <Row>
            <Col>
              <h1>Vini Token Sale</h1>
              <br />
            </Col>
          </Row>
          <Row>
            <Col>
              <h2>Get your tokens now!</h2>
              <br />
            </Col>
          </Row>
          <Row>
            <Col>
              <h3>Enable your account</h3>
              <br />
            </Col>
          </Row>
          <Row>
            <Col sm="12" md={{ size: 6, offset: 3 }}>
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  Address to allow:
                </InputGroupAddon>
                <Input
                  type="text"
                  name="kycAddress"
                  value={this.state.kycAddress}
                  onChange={this.handleInputChange}
                />
                <InputGroupAddon addonType="append">
                  <Button color="primary" onClick={this.handleKycSubmit}>
                    Add Address to Whitelist
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <br />
              <h2>Buy Vini Tokens</h2>
            </Col>
          </Row>
          <Row className="Cards">
            <Col>
              <Card
                body
                inverse
                style={{ backgroundColor: '#333', borderColor: '#333' }}
              >
                <CardBody>
                  <CardTitle tag="h5">1 VINI Token</CardTitle>
                  <CardText>Obtain 1 VINI Token.</CardText>
                  <Button
                    color="primary"
                    onClick={() => this.handleBuyToken(1)}
                  >
                    Buy Now
                  </Button>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <Card
                body
                inverse
                style={{ backgroundColor: '#333', borderColor: '#333' }}
              >
                <CardBody>
                  <CardTitle tag="h5">10 VINI Tokens</CardTitle>
                  <CardText>Obtain 10 VINI Tokens.</CardText>
                  <Button
                    color="primary"
                    onClick={() => this.handleBuyToken(10)}
                  >
                    Buy Now
                  </Button>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <Card
                body
                inverse
                style={{ backgroundColor: '#333', borderColor: '#333' }}
              >
                <CardBody>
                  <CardTitle tag="h5">100 VINI Tokens</CardTitle>
                  <CardText>Obtain 100 VINI Tokens.</CardText>
                  <Button
                    color="primary"
                    onClick={() => this.handleBuyToken(100)}
                  >
                    Buy Now
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <br />
              <p>You have: {this.state.userTokens} VINI Tokens</p>
            </Col>
          </Row>
        </div>
      </Container>
    );
  }
}

export default App;
