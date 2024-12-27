import exppress from "express";
import bodyParser from "body-parser";
import moviesRouter from "./routes/movies";

const app = exppress();
const port = 8000;

app.use(bodyParser.json());

app.use("/movies", moviesRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
