import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri: string = process.env.DB_URI || "";
const dbName: string = process.env.DB_NAME || "";

class MongoDBClient {
  private static instance: MongoDBClient;
  private client: MongoClient;
  private db: Db | null = null;

  private constructor() {
    this.client = new MongoClient(mongoUri);
  }

  public static getInstance(): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient();
    }
    return MongoDBClient.instance;
  }

  public async connect(uri?: string): Promise<Db> {
    if (this.db) {
      console.log("Already connected to MongoDB");
      return this.db;
    }

    try {
      await this.client.connect();
      console.log("Connected to MongoDB");
      this.db = this.client.db(dbName);
      return this.db;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  public getDb(): Db | null {
    return this.db;
  }
}

export const mongoClient = MongoDBClient.getInstance();
