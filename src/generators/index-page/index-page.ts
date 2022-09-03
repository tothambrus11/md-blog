import {Category} from "../../category.js";
import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';
import * as postListGenerator from "../post-list/post-list.js";
import * as headerGenerator from "../header/header.js";
import * as footerGenerator from "../footer/footer.js";
import {Post} from "../../post.js";
import {HeaderData} from "../header/header.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let template: string;

export function init() {
    template = fs.readFileSync(path.join(__dirname, "index-page.html")).toString();
}

export function generate(posts: Post[], headerData: HeaderData) {
    return template
        .replaceAll("$page-header$", headerGenerator.generate("Jeune Street - Bence Hervay's website", "", headerData))
        .replaceAll("$page-footer$", footerGenerator.generate(headerData.baseUrl))
        .replaceAll("$post-list$", postListGenerator.generate(posts, headerData.baseUrl));
}