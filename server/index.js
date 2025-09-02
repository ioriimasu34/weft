<<<<<<< HEAD
console.log('server stub');
=======
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.get("/healthz", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`weft server listening on :${port}`));
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
