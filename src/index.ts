import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import { getFiles } from "./file";
import { uploadFile } from "./aws";
import path from "path";
import { createClient } from "redis";
const app = express();
const client = createClient();
client.connect();
app.use(cors());
app.use(express.json());

app.get("/", (req: any, res: any) => {
  return res.json({ msg: "success" });
});

app.post("/deploy", async (req: any, res: any) => {
  const repoUrl = req.body.repoUrl;
  if (!repoUrl) {
    return res.json({ msg: "No file recieved", status: 400 });
  }
  console.log(repoUrl);
  const id = generate();
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
  const files = getFiles(path.join(__dirname, `output/${id}`));
  files.forEach((file) => {
    const filename = path.relative(__dirname, file).replace(/\\/g, "/");
    uploadFile(filename, file);
  });
  client.lPush("build-queue", id);
  return res.json({ msg: "recieved file", id, status: 200 });
});

app.listen(3000, () => {
  console.log("server started on port 3000");
});
// tsc -b to run convert the tsc file into js
