import {Post} from "../../post.js";

import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';
import * as postCardGenerator from "./post-card/post-card.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let template: string;

export function init() {
    template = fs.readFileSync(path.join(__dirname, "post-list.html")).toString();
    postCardGenerator.init();
}

export function generate(posts: Post[]) {
    return template.replace("$posts$", posts.map(p => postCardGenerator.generate(p)).join(""));
}