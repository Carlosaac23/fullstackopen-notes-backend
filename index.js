import express from "express";
import { Note } from "./models/note.js";

const app = express();

function requestLogger(req, res, next) {
  console.log("Method:", req.method);
  console.log("Path:  ", req.path);
  console.log("Body:  ", req.body);
  console.log("---");
  next();
}

app.use(express.static("dist"));
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.get("/api/notes", (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

app.get("/api/notes/:id", (req, res, next) => {
  const { id } = req.params;

  Note.findById(id)
    .then((note) => {
      if (note) {
        res.json(note);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/notes", (req, res, next) => {
  const { content, important } = req.body;

  const note = new Note({
    content,
    important: important || false,
  });

  note
    .save()
    .then((savedNote) => {
      res.json(savedNote);
    })
    .catch((error) => next(error));
});

app.put("/api/notes/:id", (req, res, next) => {
  const { id } = req.params;
  const { content, important } = req.body;

  Note.findById(id)
    .then((note) => {
      if (!note) return res.status(404).json({ error: "Note not found" });

      note.content = content;
      note.important = important;

      return note.save().then((updatedNote) => {
        res.json(updatedNote);
      });
    })
    .catch((error) => next(error));
});

app.delete("/api/notes/:id", (req, res, next) => {
  const { id } = req.params;

  Note.findByIdAndDelete(id)
    .then((deletedNote) => {
      if (!deletedNote) return res.status(404).json({ error: "Note not found" });

      res.status(204).end();
    })
    .catch((error) => next(error));
});

function unknownEndpoint(req, res) {
  res.status(404).send({ error: "unknown endpoint" });
}

app.use(unknownEndpoint);

function errorHandler(error, req, res, next) {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
