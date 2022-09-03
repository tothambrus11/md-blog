import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let template: string;

export function init() {
    template = fs.readFileSync(path.join(__dirname, "footer.html")).toString();
}

export function generate(baseUrl: string) {
    return template.replaceAll("$base-url$", baseUrl);
}