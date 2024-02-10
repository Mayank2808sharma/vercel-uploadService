import fs from "fs";
import path from "path";
export function getFiles(dir: string) {
  let files: string[] = [];
  const fileAndFolderList = fs.readdirSync(dir);
  for (const file of fileAndFolderList) {
    const name = path.join(dir,file);
    if (fs.statSync(name).isDirectory()) {
      const subfiles = getFiles(name);
      files.push(...subfiles);
    } else {
      files.push(name);
    }
  }
  return files;
}
