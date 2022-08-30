import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';
import {escapeHtml} from "../../escape.js";
import {Category} from "../../category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let template: string;

export function init() {
    template = fs.readFileSync(path.join(__dirname, "header.html")).toString();
}

export function generate(title: string, description: string, categories: Category[]) {
    return template
        .replaceAll("$page-title$", escapeHtml(title))
        .replaceAll("$page-description$", escapeHtml(description)); // todo navigation bar
}