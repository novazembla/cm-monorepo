import express from "express";
import cors from "cors";

export const app: express.Application = express();

app.use(cors());

export default app;
