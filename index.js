import express from "express";

const app = express();

app.use(express.static("dist"));

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

function requestLogger(req, res, next) {
  console.log("Method:", req.method);
  console.log("Path:  ", req.path);
  console.log("Body:  ", req.body);
  console.log("---");
  next();
}

app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.get("/api/notes/:id", (req, res) => {
  const id = req.params.id;
  const note = notes.find((note) => note.id === id);

  if (!note) {
    res.status(404).end();
  }

  res.json(note);
});

app.post("/api/notes", (req, res) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  const note = {
    id: String(notes.length + 1),
    content: body.content,
    important: body.important || false,
  };

  notes = [...notes, note];
  res.json(note);
});

app.delete("/api/notes/:id", (req, res) => {
  const id = req.params.id;
  const note = notes.find((note) => note.id === id);

  if (!note) {
    res.status(404).end();
  }

  notes = notes.filter((note) => note.id !== id);
  res.status(204).end();
});

function unknownEndpoint(req, res) {
  res.status(404).send({ error: "unknown endpoint" });
}

app.use(unknownEndpoint);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
