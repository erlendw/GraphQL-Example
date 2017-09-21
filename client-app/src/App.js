import React, { Component } from "react";
import { gql, graphql, withApollo } from "react-apollo";
import Submit from "./Submit";
 

const GET_MESSAGES_QUERY = gql`query {
    messages{
      _id
      text
      timestamp
      fromUser{
        _id
        firstname
        lastname
      }
    }
}`;

const ON_NEW_MESSAGE_SUBSCRIPTION = gql`
    subscription onNewMessage {
        newMessage{
          _id
          text
          timestamp
          fromUser{
            _id
            firstname
            lastname
          }
        }
    }
`;

//@withApollo - react-scripts do not yet support decorators - https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#can-i-use-decorators
class App extends Component {

  constructor() {
    super();
    this.state = {
      messageList: [],
      message : ""
    };
  }

  componentWillReceiveProps = (nextProps) => {
    if (!nextProps.data.loading) {

      console.log(this.props.data.messages)

      this.setState({
        messageList: nextProps.data.messages
      });

      /*if (this.subscription) {
        if (nextProps.data.messages !== this.props.data.messages) {
          // if the feed has changed, we need to unsubscribe before resubscribing
          this.subscription.unsubscribe();
        } else {
          // we already have an active subscription with the right params
          return;
        }
      }*/

      this.subscription = nextProps.data.subscribeToMore({
        document: ON_NEW_MESSAGE_SUBSCRIPTION,
        // this is where the magic happens.
        updateQuery: this.updateQuery,
        onError: (err) => console.error(err),
      });
    }
  };

  componentWillUnmount = () => {
    this.subscription.unsubscribe();
  };

  updateQuery = (prev, {subscriptionData}) => {

    console.log("this message triggers")

    //this.props.data.refetch()

    const newMessage = subscriptionData.data.newMessage;
    console.log(newMessage) 
    return this.onNewMessage(newMessage);
  };

  onNewMessage = (message) => {
    console.log(message)
    this.setState({
      messageList: [...this.state.messageList, message]
    });
    return this.state.messageList;
  };

  render() {
    const {loading} = this.props.data;
    console.log(this.props);
    return (
      <main>
        <header>
          <Submit />
        </header>
        { loading ? (<p>Loading…</p>) : (
          
          <div>

                {Array.apply(0, this.state.messageList).map((x,i)=>{
                    return(
                        <div key={i}>
                          
                          <div>Message from: {x.fromUser.firstname + " " + x.fromUser.lastname}</div>
                          <div>Message text: {x.text}</div>
                          <div>At: {x.timestamp}</div>
                          
                          <br></br>
                          
                          
                        </div>
                    );
                })}

          </div>

           )}
      </main>
    );
  }
}

export default graphql(
  GET_MESSAGES_QUERY
)(withApollo(App))
