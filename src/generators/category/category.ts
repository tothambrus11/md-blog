import {Category} from "../../category.js";
import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';
import * as postListGenerator from "../post-list/post-list.js";
import * as headerGenerator from "../header/header.js";
import * as footerGenerator from "../footer/footer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let template: string;

export function init() {
    template = fs.readFileSync(path.join(__dirname, "category.html")).toString();
}

export function generate(category: Category, categories: Category[]) {
    return template
        .replaceAll("$page-header$", headerGenerator.generate("Category: " + category.displayName, "", categories))
        .replaceAll("$page-footer$", footerGenerator.generate())
        .replaceAll("$displayName$", category.displayName)
        .replaceAll("$post-list$", postListGenerator.generate(category.posts));
}