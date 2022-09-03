import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';
import {escapeHtml} from "../../escape.js";
import {Category} from "../../category.js";
import * as menuItemGenerator from "./menu-item/menu-item.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let template: string;

export function init() {
    template = fs.readFileSync(path.join(__dirname, "header.html")).toString();
    menuItemGenerator.init();
}

export interface HeaderData{
    categories: Category[];
    baseUrl: string;
}

export function generate(title: string, description: string, headerData: HeaderData) {
    let menuItems = [
        {
            title: "Home",
            url: headerData.baseUrl,
        },
        ...headerData.categories.map(category => {
            return {
                title: category.displayName,
                url: headerData.baseUrl + category.slug
            }
        })
    ];

    return template
        .replace("$page-title$", escapeHtml(title))
        .replace("$base-url$", headerData.baseUrl)
        .replace("$page-description$", escapeHtml(description)) // todo navigation bar
        .replace("$menu-items$", menuItems.map(mi=>menuItemGenerator.generate(mi.title, mi.url)).join(""))
}