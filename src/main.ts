import * as fs from "fs/promises";
import {readdir} from "fs/promises";
import * as fss from "fs";
import path from "path";
import {Category} from "./category.js";
import {Post} from "./post.js";
import * as categoryGenerator from "./generators/category/category.js";
import * as postListGenerator from "./generators/post-list/post-list.js";
import * as headerGenerator from "./generators/header/header.js";
import {HeaderData} from "./generators/header/header.js";
import * as footerGenerator from "./generators/footer/footer.js";
import * as postGenerator from "./generators/post/post.js";
import * as indexPageGenerator from "./generators/index-page/index-page.js";
import fse from "fs-extra";
import {fileURLToPath} from "url";
import configs from "./config.js";
import chalk from "chalk";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let config = process.argv[0] === "--prod" ? configs.prodConfig : configs.devConfig;

const folderNamePad = 40;

let projectRootDir = path.dirname(__dirname + '.txt');

function slugify(text: string) {
    return text.replaceAll(/\s/g, '-').toLowerCase();
}

async function getDirectories(source) {
    return (await readdir(source, {withFileTypes: true}))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

let categoryFolders: string[];
try {
    categoryFolders = await getDirectories(config.sourceDir);
} catch (e) {
    console.log(chalk.red("Invalid source folder given. posts subfolder not found"));
    process.exit(2);
}

let categories = await Promise.all(categoryFolders.map(async (cf): Promise<Category> => {
    let si = cf.lastIndexOf("(");
    let ei = cf.lastIndexOf(")");
    let slug: string;
    let displayName: string;

    if (si == -1 && ei == -1) {
        let slug = slugify(cf);
        let cfRenamed = (cf + " ").padEnd(folderNamePad, " ") + "(" + slug + ")";

        console.log("Renaming category folder to ", cfRenamed);
        await fs.rename(
            path.join(projectRootDir, config.sourceDir, cf),
            path.join(projectRootDir, config.sourceDir, cfRenamed)
        );
        return {
            displayName: cf,
            slug: slug,
            sourceFolder: path.join(config.sourceDir, cfRenamed),
            posts: []
        }
    } else {
        if (si == -1 || ei == -1 || si > ei) {
            console.log(chalk.red("Invalid category directory name:"), cf);
            process.exit(3)
        }
        return {
            displayName: cf.slice(0, si).trimEnd(),
            slug: cf.slice(si + 1, ei),
            sourceFolder: path.join(config.sourceDir, cf),
            posts: []
        }
    }
}));

let posts: Post[] = [];
for (const category of categories) {
    let postFolders = await getDirectories(category.sourceFolder);

    category.posts = await Promise.all(postFolders.map(async (postFolder): Promise<Post> => {
        let si = postFolder.lastIndexOf("(");
        let ei = postFolder.lastIndexOf(")");
        let slug: string;
        let displayName: string;
        if (si == -1 && ei == -1) { // no date or slug
            let slug = slugify(postFolder);
            let date = (new Date()).toISOString().split('T')[0]; // saving UTC date
            let newPath = path.join(category.sourceFolder, `${(postFolder + " ").padEnd(folderNamePad, " ")}(${slug} ${date})`)
            await fs.rename(
                path.join(category.sourceFolder, postFolder),
                newPath
            );

            return {
                title: postFolder,
                slug,
                sourceFolder: newPath,
                category,
                date,
            }
        } else {
            let spaceI = postFolder.lastIndexOf(' ');
            if (si == -1 || ei == -1 || spaceI == -1 || si > ei || spaceI > ei) {
                console.log(chalk.red("Invalid post directory name:"), postFolder);
                process.exit(4)
            }
            return {
                title: postFolder.slice(0, si).trimEnd(),
                slug: postFolder.slice(si + 1, spaceI).trimEnd(),
                date: postFolder.slice(spaceI + 1, ei),
                sourceFolder: path.join(category.sourceFolder, postFolder),
                category: category
            }
        }
    }));

    posts.push(...category.posts)
}

async function generateOutput() {
    try {
        fss.rmSync(config.outDir, {recursive: true, force: true});
    } catch (e) {

    }

    try {
        fss.mkdirSync(config.outDir);
    } catch (e) {
        fss.mkdirSync(path.dirname(config.outDir + ".txt"));
        fss.mkdirSync(config.outDir);
    }

    categoryGenerator.init();
    postListGenerator.init();
    headerGenerator.init();
    footerGenerator.init();
    postGenerator.init(config.baseUrl);
    indexPageGenerator.init();

    let headerData: HeaderData = {
        baseUrl: config.baseUrl,
        categories
    }
    // Generate category pages
    for (let category of categories) {
        fss.mkdirSync(path.join(config.outDir, category.slug));
        fss.writeFileSync(path.join(config.outDir, category.slug, "index.html"), categoryGenerator.generate(category, headerData));
    }

    // generate post pages
    for (let post of posts) {
        let postOutDir = path.join(config.outDir, post.category.slug, post.slug);
        fss.mkdirSync(postOutDir);
        fss.writeFileSync(path.join(postOutDir, "index.html"), postGenerator.generate(post, projectRootDir, config.outDir, headerData));
    }

    // generate index page
    fss.writeFileSync(path.join(config.outDir, "index.html"), indexPageGenerator.generate(posts, headerData));
    // Copy assets folder
    fse.copySync(path.join(projectRootDir, "src", "assets"), path.join(config.outDir, "assets"));
}

await generateOutput();