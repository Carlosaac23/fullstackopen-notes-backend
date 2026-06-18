const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

function requestLogger(req, res, next) {
  console.log("Method:", req.method);
  console.log("Path:  ", req.path);
  console.log("Body:  ", req.body);
  console.log("---");
  next();
}

app.use(requestLogger);

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

function generateId() {
  const maxId = notes.length > 0 ? Math.max(...notes.map((note) => note.id)) : 0;
  return maxId + 1;
}

app.post("/api/notes", (req, res) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({ error: "content missing" });
  }

  const note = {
    content: body.content,
    important: Boolean(body.important) || false,
    id: generateId(),
  };

  notes = notes.concat(note);

  res.json(note);
});

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.get("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((note) => note.id === id);

  if (!note) {
    return res.status(404).end();
  }

  res.json(note);
});

app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  notes = notes.filter((note) => note.id !== id);

  res.status(204).end();
});

function unknownEndpoint(req, res) {
  res.status(404).send({ error: "unknown endpoint" });
}

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
