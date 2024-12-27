import request from 'supertest';
import express from 'express';
import { mongoClient } from '../database/mongoClient';
import router from '../routes/movies';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

// Create an in-memory MongoDB server instance
let mongoServer: MongoMemoryServer;
let uri: string;

jest.mock('../middleware/checkAdminRole', () => ({
  checkAdminRole: jest.fn((req, res, next) => {
    if (req.method === 'PUT' || req.method === 'DELETE') {
      next();
    } else {
      next();
    }
  }),
}));

const app = express();
app.use(express.json());
app.use('/movies', router);

beforeAll(async () => {
  // Start the in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  uri = mongoServer.getUri();

  // Update mongoClient to use the in-memory database URI
  await mongoClient.connect(uri);
});

afterAll(async () => {
  // Close the in-memory MongoDB server after tests
  await mongoServer.stop();
});

describe('Movies API', () => {
  // Health Check route
  it('should return a health check message', async () => {
    const res = await request(app).get('/movies/health-check');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Application is running successfully');
  });

  // Get all movies route
  it('should fetch all movies', async () => {
    const mockMovies = [{
      title: 'Inception',
      genre: 'Sci-Fi',
      rating: '8.8',
      streamingLink: 'https://example.com/inception',
    }];
    
    const db = await mongoClient.getDb();
    if (!db) {
        throw new Error("Database connection failed or is not established");
      }
    const moviesCollection = db.collection('movies');
    await moviesCollection.insertMany(mockMovies); // Insert mock movies into in-memory DB

    const res = await request(app).get('/movies/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockMovies);
  });

  // Add a new movie route
  it('should create a new movie', async () => {
    const newMovie = {
      title: 'Inception',
      genre: 'Sci-Fi',
      rating: '8.8',
      streamingLink: 'https://example.com/inception',
    };

    const res = await request(app).post('/movies/').send(newMovie);
    expect(res.status).toBe(200);

    const db = await mongoClient.getDb();
    if (!db) {
        throw new Error("Database connection failed or is not established");
      }
    const moviesCollection = db.collection('movies');
    const movie = await moviesCollection.findOne({ title: 'Inception' });
    expect(movie).toBeTruthy(); // Ensure movie is added to the DB
  });

  // Update a movie route (Admin Role Required)
  it('should update a movie if admin', async () => {
    const updatedMovie = {
      title: 'Inception',
      genre: 'Sci-Fi',
      rating: '9.0',
      streamingLink: 'https://updated-example.com',
    };

    const db = await mongoClient.getDb();
    if (!db) {
        throw new Error("Database connection failed or is not established");
      }
    const moviesCollection = db.collection('movies');
    const { insertedId } = await moviesCollection.insertOne({
      title: 'Inception',
      genre: 'Sci-Fi',
      rating: '8.8',
      streamingLink: 'https://example.com/inception',
    });

    const res = await request(app)
      .put(`/movies/${insertedId}`)
      .set('role', 'admin')
      .send(updatedMovie);

    expect(res.status).toBe(200);

    const updatedMovieInDb = await moviesCollection.findOne({ _id: insertedId });
    expect(updatedMovieInDb).toMatchObject(updatedMovie);
  });

  // Delete a movie route
  it('should delete a movie if admin', async () => {
    const db = await mongoClient.getDb();
    if (!db) {
        throw new Error("Database connection failed or is not established");
      }
    const moviesCollection = db.collection('movies');
    const { insertedId } = await moviesCollection.insertOne({
      title: 'Inception',
      genre: 'Sci-Fi',
      rating: '8.8',
      streamingLink: 'https://example.com/inception',
    });

    const res = await request(app)
      .delete(`/movies/${insertedId}`)
      .set('role', 'admin')
      .send();

    expect(res.status).toBe(200);

    const deletedMovie = await moviesCollection.findOne({ _id: insertedId });
    expect(deletedMovie).toBeNull(); // Movie should be deleted from the DB
  });
});
