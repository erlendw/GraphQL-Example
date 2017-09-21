import { MongoClient} from 'mongodb'

export class mongoProvider{

    constructor(mongourl){
        this.MONGO_URL = mongourl; 
    }

    async getConnection(){
        if(this.db === undefined){
            console.log("Creating db connection")
            this.db = await MongoClient.connect(this.MONGO_URL)
            this.setupCollections(this.db);
        }
        return this;

    }
    setupCollections(db){
        this.Users = db.collection('users')
        this.Messages = db.collection('messages')
        this.Chats = this.db.collection('chats')
    }

}

