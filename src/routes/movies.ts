import express, { Request, Response } from "express";
import { mongoClient } from "../database/mongoClient";
import { ObjectId } from "mongodb";
import { MOVIES } from "../constants/constants";
import { checkAdminRole } from "../middleware/checkAdminRole";

const router = express.Router();

//To check the application health
router.get("/health-check", async (req: Request, res: Response) => {
  res.status(200).json({ message: "Application is running successfully" });
});

//List all the movies in the lobby
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await mongoClient.connect();
    const movies = await db.collection(MOVIES).find().toArray();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: "Error fetching all movies" });
  }
});

//Search for a movie by title or genre
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const db = await mongoClient.connect();
    const movies = await db
      .collection(MOVIES)
      .find({ title: { $regex: q, $options: "i" } })
      .toArray();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: "Error fetching movies" });
  }
});

//Add a new movie to the lobby
router.post("/", async (req: Request, res: Response) => {
  try {
    const { id, title, genre, rating, streamingLink } = req.body;
    const db = await mongoClient.connect();
    const movie = { id, title, genre, rating, streamingLink };
    const result = await db.collection(MOVIES).insertOne(movie);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: `Error creating movie: ${error}` });
  }
});

router.put("/:id", checkAdminRole, async (req: Request, res: Response) => {
  try {
    const db = await mongoClient.connect();
    const movieId = new ObjectId(req.params.id);
    const result = await db
      .collection(MOVIES)
      .updateOne({ _id: movieId }, { $set: req.body });
    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Movie not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating movie" });
  }
});

router.delete("/:id", checkAdminRole, async (req: Request, res: Response) => {
  try {
    const db = await mongoClient.connect();
    const movieId = new ObjectId(req.params.id);
    const result = await db.collection(MOVIES).deleteOne({ _id: movieId });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Movie not found" });
    } else {
      res.status(200).json({ message: "Movie deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting movie" });
  }
});

export default router;
