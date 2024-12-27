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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const mongoClient_1 = require("../database/mongoClient");
const movies_1 = __importDefault(require("../routes/movies"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
// Create an in-memory MongoDB server instance
let mongoServer;
let uri;
jest.mock('../middleware/checkAdminRole', () => ({
    checkAdminRole: jest.fn((req, res, next) => {
        if (req.method === 'PUT' || req.method === 'DELETE') {
            next();
        }
        else {
            next();
        }
    }),
}));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/movies', movies_1.default);
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Start the in-memory MongoDB server
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    uri = mongoServer.getUri();
    // Update mongoClient to use the in-memory database URI
    yield mongoClient_1.mongoClient.connect(uri);
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Close the in-memory MongoDB server after tests
    yield mongoServer.stop();
}));
describe('Movies API', () => {
    // Health Check route
    it('should return a health check message', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app).get('/movies/health-check');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Application is running successfully');
    }));
    // Get all movies route
    it('should fetch all movies', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockMovies = [{
                title: 'Inception',
                genre: 'Sci-Fi',
                rating: '8.8',
                streamingLink: 'https://example.com/inception',
            }];
        const db = yield mongoClient_1.mongoClient.getDb();
        if (!db) {
            throw new Error("Database connection failed or is not established");
        }
        const moviesCollection = db.collection('movies');
        yield moviesCollection.insertMany(mockMovies); // Insert mock movies into in-memory DB
        const res = yield (0, supertest_1.default)(app).get('/movies/');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockMovies);
    }));
    // Add a new movie route
    it('should create a new movie', () => __awaiter(void 0, void 0, void 0, function* () {
        const newMovie = {
            title: 'Inception',
            genre: 'Sci-Fi',
            rating: '8.8',
            streamingLink: 'https://example.com/inception',
        };
        const res = yield (0, supertest_1.default)(app).post('/movies/').send(newMovie);
        expect(res.status).toBe(200);
        const db = yield mongoClient_1.mongoClient.getDb();
        if (!db) {
            throw new Error("Database connection failed or is not established");
        }
        const moviesCollection = db.collection('movies');
        const movie = yield moviesCollection.findOne({ title: 'Inception' });
        expect(movie).toBeTruthy(); // Ensure movie is added to the DB
    }));
    // Update a movie route (Admin Role Required)
    it('should update a movie if admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedMovie = {
            title: 'Inception',
            genre: 'Sci-Fi',
            rating: '9.0',
            streamingLink: 'https://updated-example.com',
        };
        const db = yield mongoClient_1.mongoClient.getDb();
        if (!db) {
            throw new Error("Database connection failed or is not established");
        }
        const moviesCollection = db.collection('movies');
        const { insertedId } = yield moviesCollection.insertOne({
            title: 'Inception',
            genre: 'Sci-Fi',
            rating: '8.8',
            streamingLink: 'https://example.com/inception',
        });
        const res = yield (0, supertest_1.default)(app)
            .put(`/movies/${insertedId}`)
            .set('role', 'admin')
            .send(updatedMovie);
        expect(res.status).toBe(200);
        const updatedMovieInDb = yield moviesCollection.findOne({ _id: insertedId });
        expect(updatedMovieInDb).toMatchObject(updatedMovie);
    }));
    // Delete a movie route
    it('should delete a movie if admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield mongoClient_1.mongoClient.getDb();
        if (!db) {
            throw new Error("Database connection failed or is not established");
        }
        const moviesCollection = db.collection('movies');
        const { insertedId } = yield moviesCollection.insertOne({
            title: 'Inception',
            genre: 'Sci-Fi',
            rating: '8.8',
            streamingLink: 'https://example.com/inception',
        });
        const res = yield (0, supertest_1.default)(app)
            .delete(`/movies/${insertedId}`)
            .set('role', 'admin')
            .send();
        expect(res.status).toBe(200);
        const deletedMovie = yield moviesCollection.findOne({ _id: insertedId });
        expect(deletedMovie).toBeNull(); // Movie should be deleted from the DB
    }));
});
