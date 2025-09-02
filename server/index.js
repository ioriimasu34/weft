<<<<<<< HEAD
<<<<<<< HEAD
console.log('server stub');
=======
=======
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.get("/healthz", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`weft server listening on :${port}`));
<<<<<<< HEAD
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
=======
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
