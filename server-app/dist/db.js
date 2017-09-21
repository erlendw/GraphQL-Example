'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mongoProvider = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodb = require('mongodb');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mongoProvider = exports.mongoProvider = function () {
    function mongoProvider(mongourl) {
        _classCallCheck(this, mongoProvider);

        this.MONGO_URL = mongourl;
    }

    _createClass(mongoProvider, [{
        key: 'getConnection',
        value: async function getConnection() {
            if (this.db === undefined) {
                console.log("Creating db connection");
                this.db = await _mongodb.MongoClient.connect(this.MONGO_URL);
                this.setupCollections(this.db);
            }
            return this;
        }
    }, {
        key: 'setupCollections',
        value: function setupCollections(db) {
            this.Users = db.collection('users');
            this.Messages = db.collection('messages');
            this.Chats = this.db.collection('chats');
        }
    }]);

    return mongoProvider;
}();