"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var typeDefs = "\n\n\n  input inUser{\n    _id : String!\n  }\n\n  input inChat{\n    _id : String!\n  }\n  \n  type User {\n    _id : String\n    firstname : String\n    lastname : String\n    chathistory : [Chat]\n  }\n\n  type Chat{\n    _id : String\n    title: String\n    users : [User]\n    messages : [Message]\n    timestamp : String      \n  }\n\n  type Message{\n    _id : String\n    fromUser : User\n    toChat : Chat\n    text : String\n    timestamp : String\n  }\n\n  type Query {\n    message(_id: String): Message\n    user(_id: String): User\n    chat(_id: String): Chat\n    users: [User]\n    chats: [Chat]\n    messages: [Message]\n  }\n\n  type Mutation {\n    createChat(title: String, users : [inUser]) : Chat\n    createUser(firstname: String, lastname: String): User\n    createMessage(fromUser:inUser, toChat:inChat, text: String): Message\n\n    updateChat(_id: String, user: inUser, add:Boolean, remove:Boolean):Chat\n  }\n  \ntype Subscription {\n  newMessage: Message\n  userAdded(chatId): Chat\n}\n";

exports.typeDefs = typeDefs;