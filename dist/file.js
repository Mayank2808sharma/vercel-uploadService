"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiles = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getFiles(dir) {
    let files = [];
    const fileAndFolderList = fs_1.default.readdirSync(dir);
    for (const file of fileAndFolderList) {
        const name = path_1.default.join(dir, file);
        if (fs_1.default.statSync(name).isDirectory()) {
            const subfiles = getFiles(name);
            files.push(...subfiles);
        }
        else {
            files.push(name);
        }
    }
    return files;
}
exports.getFiles = getFiles;
