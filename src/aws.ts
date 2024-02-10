import { S3 } from "aws-sdk";
require("dotenv").config();
import fs from "fs";
const s3 = new S3({
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey:process.env.SECRETACCESSKEY,
});
export const uploadFile = (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const params = {
    Bucket: "vercel",
    Key: fileName,
    Body: fileContent,
  };
   s3.upload(params, (err: any, data: any) => {
    if (err) {
      console.log("Error uploading file:", err);
    } else {
      console.log("File uploaded successfully. File location:", data.Location);
    }
  });
};
