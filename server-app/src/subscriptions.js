import {PubSub, SubscriptionManager} from "graphql-subscriptions";
import {mongoProvider} from "./db"
import {makeExecutableSchema} from "graphql-tools";
import {typeDefs} from './schema'
import {ObjectId } from 'mongodb'
var moment = require('moment'); 


const MONGO_URL = 'mongodb://localhost:27017/blog'


const pubsub = new PubSub();
const database = new mongoProvider(MONGO_URL);

const prepare = (o) => {
  o._id = o._id.toString()
  return o
}

const resolvers = {
  Query: {
     //get specific
     user: async (root, { _id }, context, info) => {
      var db = await database.getConnection();
      return prepare(await db.Users.findOne(ObjectId(_id)))
    },
    chat: async (root, { _id }, context, info) => {
      var db = await database.getConnection();
      return prepare(await db.Chats.findOne(ObjectId(_id)))
    },
    message: async (root, { _id }, context, info) => {
      var db = await database.getConnection();
      return prepare(await db.Messages.findOne(ObjectId(_id)))
    },
    //get all
    users: async (obj, args, context, info) => {
      var db = await database.getConnection();
      return (await db.Users.find({}).toArray()).map(prepare)
    },
    chats: async (obj, args, context, info) => {
      var db = await database.getConnection();
      return (await db.Chats.find({}).toArray()).map(prepare)
    },
    messages: async (obj, args, context, info) => {
      var db = await database.getConnection();
      return (await db.Messages.find({}).toArray()).map(prepare)
    }
  },
  Mutation: {
    createUser: async (root, args, context, info) => {
      var db = await database.getConnection();      
      const res = await db.Users.insertOne(args)
      return prepare(await db.Users.findOne({ _id: res.insertedId }))
    },
    createChat: async (root, args, context, info) => {
      var db = await database.getConnection();      
      const res = await db.Chats.insertOne(args)
      return prepare(await db.Chats.findOne({ _id: res.insertedId }))
    },
    createMessage: async (root, args, context, info) => {
      var db = await database.getConnection();            
      args.timestamp = moment().toLocaleString();
      const res = await db.Messages.insertOne(args);
      var messageRef = { _id: res.insertedId};
      db.Chats.update({ _id: ObjectId(args.toChat._id) }, { $push: { messages: messageRef } })
      var insertedMessage = await db.Messages.findOne({ _id: res.insertedId});     
      pubsub.publish('newMessage', insertedMessage);
      return prepare(insertedMessage)
    },
    updateChat: async (root, args, context, info) => {
      var db = await database.getConnection();
      if(args.add && args.remove){
        return null;
      }
      if(args.add){
        db.Chats.update({ _id: ObjectId(args._id) }, { $push: { users: args.user } })
        var chat = await db.Chats.findOne({ _id: ObjectId(args._id)});
        pubsub.publish('userAdded', chat);
        return prepare(chat);
      }
      if(args.remove){
        db.Chats.update({ _id: ObjectId(args._id) }, { $pop: { users: args.user } })
      }
    }
  },
  Subscription:{
    newMessage: async (payload) => {
      console.log('denne trigger')
      return payload;
    },
    userAdded: async (payload) => {
      console.log('denne trigger');
      return payload;
    }
  },
  Chat: {
    users: async (root, args, context, info) => {
      var db = await database.getConnection();            
      var ids = [];
      for (var i = 0; i < root.users.length; i++) {
        ids.push(root.users[i]._id);
      }

      var obj_ids = ids.map((id) => { return ObjectId(id) })
      return (await db.Users.find({ _id: { $in: obj_ids } }).toArray()).map(prepare)
    },
    messages: async (root, args, context, info) => {
      var db = await database.getConnection();      
      
      if (root.messages == null) {
        return [];
      }

      var ids = [];
      for (var i = 0; i < root.messages.length; i++) {
        ids.push(root.messages[i]._id);
      }
      var obj_ids = ids.map((id) => { return ObjectId(id) })
      return (await db.Messages.find({ _id: { $in: obj_ids } }).toArray()).map(prepare)
    }
  },
  Message: {
    fromUser: async (root, args, context, info) => {
      var db = await database.getConnection();
      return prepare(await db.Users.findOne(ObjectId(root.fromUser._id)))
    },
    toChat: async (root, args, context, info) => {
      var db = await database.getConnection();
      return prepare(await db.Chats.findOne(ObjectId(root.toChat._id)))
    }
  },
  User: {
    chathistory: async (root, args, context, info) => {
      var db = await database.getConnection();      
      await db.Chats.find({ users: { $elemMatch: { _id: ObjectId(root._id) } } }, ((res) => {
        return prepare(res);
      }))
    }
  }
};

const schema = makeExecutableSchema({typeDefs, resolvers});
const subscriptionManager = new SubscriptionManager({schema, pubsub});


export {subscriptionManager, pubsub, schema, resolvers};