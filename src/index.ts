import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import { getAllFiles } from "./file";
import path from "path";
import { uploadFile } from "./aws";
import { createClient } from "redis";

const publisher = createClient(); // to store id in the queue
publisher.connect();

const subscriber = createClient(); // to store about the status being uploaded or deployed
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generate(); // something like asd12
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`)); // clones the repo in dist/output

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  files.forEach(async (file) => {
    const filename = path.relative(__dirname, file).replace(/\\/g, "/");
    await uploadFile(filename, file); // upload all the files to the R2 bucket
  });

  await new Promise((resolve) => setTimeout(resolve, 5000)); // waiting for 5 seconds so that id does not get stored in the queue
  // before the code gets deployed to R2

  publisher.lPush("build-queue", id);  // store the id in the queue shared by upload service and deploy service
  publisher.hSet("status", id, "uploaded"); // store the status in redis regarding project being uploaded or deployed

  res.json({
    id: id,
  });
});

app.get("/status", async (req, res) => {  // api to get the status of the project
  const id = req.query.id;
  const response = await subscriber.hGet("status", id as string);
  res.json({
    status: response,
  });
});

app.listen(3000);
