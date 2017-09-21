"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.start = undefined;

var _http = require("http");

var _subscriptionsTransportWs = require("subscriptions-transport-ws");

var _graphqlServerExpress = require("graphql-server-express");

var _subscriptions = require("./subscriptions");

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _cors = require("cors");

var _cors2 = _interopRequireDefault(_cors);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _mongodb = require("mongodb");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MONGO_URL = 'mongodb://localhost:27017/blog';

var start = async function start() {
    try {
        //lets create a database connection

        var db = await _mongodb.MongoClient.connect(MONGO_URL);
        var Users = db.collection('users');
        var Messages = db.collection('messages');
        var Chats = db.collection('chats');

        // Create WebSocket server
        var appWS = (0, _http.createServer)(function (request, response) {
            response.writeHead(404);
            response.end();
        });

        var subscriptionServer = new _subscriptionsTransportWs.SubscriptionServer({
            onConnect: async function onConnect(connectionParams) {
                console.log('WebSocket connection established');
            },
            subscriptionManager: _subscriptions.subscriptionManager
        }, {
            server: appWS,
            path: '/'
        });

        appWS.listen(5000, function () {
            console.log("Websocket listening on port 5000");
        });

        // Init HTTP server and GraphQL Endpoints
        var app = (0, _express2.default)();
        app.use('*', (0, _cors2.default)());
        app.use('/graphql', _bodyParser2.default.json(), (0, _graphqlServerExpress.graphqlExpress)(function (request) {
            return {
                schema: _subscriptions.schema,
                context: {
                    Users: Users,
                    Messages: Messages,
                    Chats: Chats
                }
            };
        }));
        app.use('/graphiql', (0, _graphqlServerExpress.graphiqlExpress)({ endpointURL: '/graphql', query: 'query { messages }' }));

        app.listen(5060, function () {
            console.log("Server listening on port 5060");
        });
    } catch (e) {
        console.log(e);
    }
};

exports.start = start;