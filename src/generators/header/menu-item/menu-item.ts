import {Category} from "../../../category.js";
import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let template: string;

export function init() {
    template = fs.readFileSync(path.join(__dirname, "menu-item.html")).toString();
}

export function generate(title: string, url: string) {
    return template
        .replaceAll("$menu-item-title$", title)
        .replaceAll("$menu-item-url$", url);
}