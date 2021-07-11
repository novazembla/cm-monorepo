import express from "express";
import cors from "cors";

export const app: express.Application = express();

app.use(
  cors({
    origin: "http://localhost:4001", // TODO: research find solution also why has it to double up? with the server cors
    credentials: true,
    methods: "GET,PUT,POST,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

export default app;
