// src/index.ts — entrypoint; app'i testler doğrudan import eder.
import app from "./server";

app.listen(3000, () => console.log("rss-ozet: http://localhost:3000"));
