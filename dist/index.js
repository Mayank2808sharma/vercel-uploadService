"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const simple_git_1 = __importDefault(require("simple-git"));
const utils_1 = require("./utils");
const file_1 = require("./file");
const path_1 = __importDefault(require("path"));
const aws_1 = require("./aws");
const redis_1 = require("redis");
const publisher = (0, redis_1.createClient)(); // to store id in the queue
publisher.connect();
const subscriber = (0, redis_1.createClient)(); // to store about the status being uploaded or deployed
subscriber.connect();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/deploy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoUrl = req.body.repoUrl;
    const id = (0, utils_1.generate)(); // something like asd12
    yield (0, simple_git_1.default)().clone(repoUrl, path_1.default.join(__dirname, `output/${id}`)); // clones the repo in dist/output
    const files = (0, file_1.getAllFiles)(path_1.default.join(__dirname, `output/${id}`));
    files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
        const filename = path_1.default.relative(__dirname, file).replace(/\\/g, "/");
        yield (0, aws_1.uploadFile)(filename, file); // upload all the files to the R2 bucket
    }));
    yield new Promise((resolve) => setTimeout(resolve, 5000)); // waiting for 5 seconds so that id does not get stored in the queue
    // before the code gets deployed to R2
    publisher.lPush("build-queue", id); // store the id in the queue shared by upload service and deploy service
    publisher.hSet("status", id, "uploaded"); // store the status in redis regarding project being uploaded or deployed
    res.json({
        id: id,
    });
}));
app.get("/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield subscriber.hGet("status", id);
    res.json({
        status: response,
    });
}));
app.listen(3000);
