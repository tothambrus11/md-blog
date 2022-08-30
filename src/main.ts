import * as fs from "fs/promises";
import {readdir} from "fs/promises";
import * as fss from "fs";
import path from "path";
import {Category} from "./category.js";
import {Post} from "./post.js";
import * as categoryGenerator from "./generators/category/category.js";
import * as postListGenerator from "./generators/post-list/post-list.js";
import * as headerGenerator from "./generators/header/header.js";
import * as footerGenerator from "./generators/footer/footer.js";

const folderNamePad = 40;
let sourceFolder = process.argv[2];
if (!sourceFolder) {
    console.error("No source folder was specified in the program line arguments")
    process.exit(1);
}

let outFolder = process.argv[3];
if (!outFolder) {
    console.error("No output folder was specified in the program line arguments")
    process.exit(1);
}

function slugify(text: string) {
    return text.replaceAll(/\s/g, '-').toLowerCase();
}

const getDirectories = async source =>
    (await readdir(source, {withFileTypes: true}))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

let categoryFolders: string[];
try {
    categoryFolders = await getDirectories(path.join(sourceFolder, "posts"));
} catch (e) {
    console.error("Invalid source folder given. posts subfolder not found");
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
            path.join(sourceFolder, cf),
            path.join(sourceFolder, cfRenamed)
        );
        return {
            displayName: cf,
            slug: slug,
            sourceFolder: path.join(sourceFolder, "posts", cfRenamed),
            posts: []
        }
    } else {
        if (si == -1 || ei == -1 || si > ei) {
            console.log("Invalid category directory name:", cf);
            process.exit(3)
        }
        return {
            displayName: cf.slice(0, si).trimEnd(),
            slug: cf.slice(si + 1, ei),
            sourceFolder: path.join(sourceFolder, "posts", cf),
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
                console.log("Invalid post directory name:", postFolder);
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
    fss.rmSync(outFolder, {recursive: true, force: true});
    fss.mkdirSync(outFolder);

    categoryGenerator.init();
    postListGenerator.init();
    headerGenerator.init();
    footerGenerator.init();

    // Generate category pages
    for(let category of categories){
        fss.mkdirSync(path.join(outFolder, category.slug));
        fss.writeFileSync(path.join(outFolder, category.slug, "index.html"), categoryGenerator.generate(category, categories));
    }
}

await generateOutput();