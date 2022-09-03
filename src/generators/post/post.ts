import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';
import * as headerGenerator from "../header/header.js";
import {HeaderData} from "../header/header.js";
import * as footerGenerator from "../footer/footer.js";
import {Post} from "../../post.js";
import {marked} from "marked";
import chalk from "chalk";


import "prismjs";
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-sass.js';
import 'prismjs/components/prism-scss.js';
import {renderer} from "./marked-renderer.js";
import fse from "fs-extra";

declare var Prism: any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let template: string;

export function init(baseUrl: string) {
    template = fs.readFileSync(path.join(__dirname, "post.html")).toString();
    marked.use({
        renderer: renderer(baseUrl),
        highlight(code: string, lang: string, callback?: (error: any, code?: string) => void): string | void {
            return highlight(code, lang);
        }
    })
}

export function generate(post: Post, rootDir: string, outDir, headerData: HeaderData) {
    let postContent: string;
    try {
        postContent = fs.readFileSync(path.join(rootDir, post.sourceFolder, "post.md")).toString();
    } catch (e) {
        console.log(chalk.red("Cannot access post file:", path.join(rootDir, post.sourceFolder, "post.md")));
        return "";
    }

    fse.copySync(path.join(rootDir, post.sourceFolder), path.join(outDir, post.category.slug, post.slug))

    postContent = marked(postContent);

    return template
        .replaceAll("$page-header$", headerGenerator.generate(post.title, "" /*todo add description */, headerData))
        .replaceAll("$page-footer$", footerGenerator.generate(headerData.baseUrl))
        .replaceAll("$post-title$", post.title)
        .replaceAll("$base-url$", headerData.baseUrl)
        .replace("$post-content$", postContent);
}

function highlight(code: string, lang: string) {
    return Prism.highlight(code, Prism.languages[lang], lang);
}