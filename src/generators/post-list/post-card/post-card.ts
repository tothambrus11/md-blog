import {Post} from "../../../post.js";


import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';
import {escapeHtml} from "../../../escape.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let template: string;

export function init() {
    template = fs.readFileSync(path.join(__dirname, "post-card.html")).toString();
}

export function generate(post: Post, baseUrl: string) {
    return template
        .replaceAll("$post-link$", baseUrl + escapeHtml(post.category.slug +"/"+post.slug))
        .replaceAll("$post-title$", escapeHtml(post.title))
        .replaceAll("$date$", escapeHtml(post.date));
}