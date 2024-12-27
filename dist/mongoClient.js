"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoClient = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoUri = process.env.DB_URI || "";
const dbName = process.env.DB_NAME || "";
class MongoDBClient {
    constructor() {
        this.db = null;
        this.client = new mongodb_1.MongoClient(mongoUri);
    }
    static getInstance() {
        if (!MongoDBClient.instance) {
            MongoDBClient.instance = new MongoDBClient();
        }
        return MongoDBClient.instance;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.db) {
                console.log("Already connected to MongoDB");
                return this.db;
            }
            try {
                yield this.client.connect();
                console.log("Connected to MongoDB");
                this.db = this.client.db(dbName);
                return this.db;
            }
            catch (error) {
                console.error("Error connecting to MongoDB:", error);
                throw error;
            }
        });
    }
}
exports.mongoClient = MongoDBClient.getInstance();
