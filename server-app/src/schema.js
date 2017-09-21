const typeDefs = `


  input inUser{
    _id : String!
  }

  input inChat{
    _id : String!
  }
  
  type User {
    _id : String
    firstname : String
    lastname : String
    chathistory : [Chat]
  }

  type Chat{
    _id : String
    title: String
    users : [User]
    messages : [Message]
    timestamp : String      
  }

  type Message{
    _id : String
    fromUser : User
    toChat : Chat
    text : String
    timestamp : String
  }

  type Query {
    message(_id: String): Message
    user(_id: String): User
    chat(_id: String): Chat
    users: [User]
    chats: [Chat]
    messages: [Message]
  }

  type Mutation {
    createChat(title: String, users : [inUser]) : Chat
    createUser(firstname: String, lastname: String): User
    createMessage(fromUser:inUser, toChat:inChat, text: String): Message

    updateChat(_id: String, user: inUser, add:Boolean, remove:Boolean):Chat
  }
  
  type Subscription {
    newMessage: Message
    userAdded(chatId:String): Chat
  }
`;

export { typeDefs }