"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const aws_sdk_1 = require("aws-sdk");
require("dotenv").config();
const fs_1 = __importDefault(require("fs"));
const s3 = new aws_sdk_1.S3({
    endpoint: process.env.ENDPOINT,
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
});
const uploadFile = (fileName, localFilePath) => {
    const fileContent = fs_1.default.readFileSync(localFilePath);
    const params = {
        Bucket: "vercel",
        Key: fileName,
        Body: fileContent,
    };
    s3.upload(params, (err, data) => {
        if (err) {
            console.log("Error uploading file:", err);
        }
        else {
            console.log("File uploaded successfully. File location:", data.Location);
        }
    });
};
exports.uploadFile = uploadFile;
