import React, { Component } from "react";
import { gql, graphql } from "react-apollo";


const CREATE_LINK_MUTATION = gql`
mutation {
    createMessage(toChat: {_id:"59ba6391fed16c32f4e1fa5e"}, fromUser:{_id:"59ae995d9cc4990c68aaa440"}, text:"ny melding fra frontenden") {
      _id
      text
      timestamp
      toChat{
            _id
          }
          fromUser{
              _id
              firstname
              lastname
          }
    }
  }
`;




//@withApollo - react-scripts do not yet support decorators - https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#can-i-use-decorators
class Submit extends Component {

    constructor() {
        super();
        this.state = {
            text: 'oppdaterer du fra state?'
        }
    }

    _createLink = async () => {
        const { text } = this.state
        await this.props.createLinkMutation({
            variables: {
                text
            }
        })
    }


    render() {
        return (
            <main>
                <div>
                    <button
                        onClick={() => this._createLink()}
                    >
                        Opprett en ny melding
        </button>
                </div>
            </main>
        );
    }
}

export default graphql(CREATE_LINK_MUTATION, { name: 'createLinkMutation' })(Submit)
