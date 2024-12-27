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
const express_1 = __importDefault(require("express"));
const mongoClient_1 = require("../database/mongoClient");
const mongodb_1 = require("mongodb");
const constants_1 = require("../constants/constants");
const checkAdminRole_1 = require("../middleware/checkAdminRole");
const router = express_1.default.Router();
//To check the application health
router.get("/health-check", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: "Application is running successfully" });
}));
//List all the movies in the lobby
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield mongoClient_1.mongoClient.connect();
        const movies = yield db.collection(constants_1.MOVIES).find().toArray();
        res.status(200).json(movies);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching all movies" });
    }
}));
//Search for a movie by title or genre
router.get("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q } = req.query;
        const db = yield mongoClient_1.mongoClient.connect();
        const movies = yield db
            .collection(constants_1.MOVIES)
            .find({ title: { $regex: q, $options: "i" } })
            .toArray();
        res.status(200).json(movies);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching movies" });
    }
}));
//Add a new movie to the lobby
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, title, genre, rating, streamingLink } = req.body;
        const db = yield mongoClient_1.mongoClient.connect();
        const movie = { id, title, genre, rating, streamingLink };
        const result = yield db.collection(constants_1.MOVIES).insertOne(movie);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: `Error creating movie: ${error}` });
    }
}));
router.put("/:id", checkAdminRole_1.checkAdminRole, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield mongoClient_1.mongoClient.connect();
        const movieId = new mongodb_1.ObjectId(req.params.id);
        const result = yield db
            .collection(constants_1.MOVIES)
            .updateOne({ _id: movieId }, { $set: req.body });
        if (result.matchedCount === 0) {
            res.status(404).json({ error: "Movie not found" });
        }
        else {
            res.status(200).json(result);
        }
    }
    catch (error) {
        res.status(500).json({ error: "Error updating movie" });
    }
}));
router.delete("/:id", checkAdminRole_1.checkAdminRole, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield mongoClient_1.mongoClient.connect();
        const movieId = new mongodb_1.ObjectId(req.params.id);
        const result = yield db.collection(constants_1.MOVIES).deleteOne({ _id: movieId });
        if (result.deletedCount === 0) {
            res.status(404).json({ error: "Movie not found" });
        }
        else {
            res.status(200).json({ message: "Movie deleted successfully" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting movie" });
    }
}));
exports.default = router;
