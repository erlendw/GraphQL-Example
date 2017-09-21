"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvers = exports.schema = exports.pubsub = exports.subscriptionManager = undefined;

var _graphqlSubscriptions = require("graphql-subscriptions");

var _db = require("./db");

var _graphqlTools = require("graphql-tools");

var _schema = require("./schema");

var _mongodb = require("mongodb");

var moment = require('moment');

var MONGO_URL = 'mongodb://localhost:27017/blog';

var pubsub = new _graphqlSubscriptions.PubSub();
var database = new _db.mongoProvider(MONGO_URL);

var prepare = function prepare(o) {
  o._id = o._id.toString();
  return o;
};

var resolvers = {
  Query: {
    //get specific
    user: async function user(root, _ref, context, info) {
      var _id = _ref._id;

      var db = await database.getConnection();
      return prepare((await db.Users.findOne((0, _mongodb.ObjectId)(_id))));
    },
    chat: async function chat(root, _ref2, context, info) {
      var _id = _ref2._id;

      var db = await database.getConnection();
      return prepare((await db.Chats.findOne((0, _mongodb.ObjectId)(_id))));
    },
    message: async function message(root, _ref3, context, info) {
      var _id = _ref3._id;

      var db = await database.getConnection();
      return prepare((await db.Messages.findOne((0, _mongodb.ObjectId)(_id))));
    },
    //get all
    users: async function users(obj, args, context, info) {
      var db = await database.getConnection();
      return (await db.Users.find({}).toArray()).map(prepare);
    },
    chats: async function chats(obj, args, context, info) {
      var db = await database.getConnection();
      return (await db.Chats.find({}).toArray()).map(prepare);
    },
    messages: async function messages(obj, args, context, info) {
      var db = await database.getConnection();
      return (await db.Messages.find({}).toArray()).map(prepare);
    }
  },
  Mutation: {
    createUser: async function createUser(root, args, context, info) {
      var db = await database.getConnection();
      var res = await db.Users.insertOne(args);
      return prepare((await db.Users.findOne({ _id: res.insertedId })));
    },
    createChat: async function createChat(root, args, context, info) {
      var db = await database.getConnection();
      var res = await db.Chats.insertOne(args);
      return prepare((await db.Chats.findOne({ _id: res.insertedId })));
    },
    createMessage: async function createMessage(root, args, context, info) {
      var db = await database.getConnection();
      args.timestamp = moment().toLocaleString();
      var res = await db.Messages.insertOne(args);
      var messageRef = { _id: res.insertedId };
      db.Chats.update({ _id: (0, _mongodb.ObjectId)(args.toChat._id) }, { $push: { messages: messageRef } });
      var insertedMessage = await db.Messages.findOne({ _id: res.insertedId });
      pubsub.publish('newMessage', insertedMessage);
      return prepare(insertedMessage);
    },
    updateChat: async function updateChat(root, args, context, info) {
      var db = await database.getConnection();
      if (args.add && args.remove) {
        return null;
      }
      if (args.add) {
        db.Chats.update({ _id: (0, _mongodb.ObjectId)(args._id) }, { $push: { users: args.user } });
        var chat = await db.Chats.findOne({ _id: (0, _mongodb.ObjectId)(args._id) });
        pubsub.publish('userAdded', chat);
        return prepare(chat);
      }
      if (args.remove) {
        db.Chats.update({ _id: (0, _mongodb.ObjectId)(args._id) }, { $pop: { users: args.user } });
      }
    }
  },
  Subscription: {
    newMessage: async function newMessage(payload) {
      console.log('denne trigger');
      return payload;
    },
    userAdded: async function userAdded(payload) {
      console.log('denne trigger');
      return payload;
    }
  },
  Chat: {
    users: async function users(root, args, context, info) {
      var db = await database.getConnection();
      var ids = [];
      for (var i = 0; i < root.users.length; i++) {
        ids.push(root.users[i]._id);
      }

      var obj_ids = ids.map(function (id) {
        return (0, _mongodb.ObjectId)(id);
      });
      return (await db.Users.find({ _id: { $in: obj_ids } }).toArray()).map(prepare);
    },
    messages: async function messages(root, args, context, info) {
      var db = await database.getConnection();

      if (root.messages == null) {
        return [];
      }

      var ids = [];
      for (var i = 0; i < root.messages.length; i++) {
        ids.push(root.messages[i]._id);
      }
      var obj_ids = ids.map(function (id) {
        return (0, _mongodb.ObjectId)(id);
      });
      return (await db.Messages.find({ _id: { $in: obj_ids } }).toArray()).map(prepare);
    }
  },
  Message: {
    fromUser: async function fromUser(root, args, context, info) {
      var db = await database.getConnection();
      return prepare((await db.Users.findOne((0, _mongodb.ObjectId)(root.fromUser._id))));
    },
    toChat: async function toChat(root, args, context, info) {
      var db = await database.getConnection();
      return prepare((await db.Chats.findOne((0, _mongodb.ObjectId)(root.toChat._id))));
    }
  },
  User: {
    chathistory: async function chathistory(root, args, context, info) {
      var db = await database.getConnection();
      await db.Chats.find({ users: { $elemMatch: { _id: (0, _mongodb.ObjectId)(root._id) } } }, function (res) {
        return prepare(res);
      });
    }
  }
};

var schema = (0, _graphqlTools.makeExecutableSchema)({ typeDefs: _schema.typeDefs, resolvers: resolvers });
var subscriptionManager = new _graphqlSubscriptions.SubscriptionManager({ schema: schema, pubsub: pubsub });

exports.subscriptionManager = subscriptionManager;
exports.pubsub = pubsub;
exports.schema = schema;
exports.resolvers = resolvers;