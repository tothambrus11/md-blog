import * as fs from "fs/promises";
import {readdir} from "fs/promises";
import path from "path";

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

const getDirectories = async source =>
    (await readdir(source, {withFileTypes: true}))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

let categoryFolders: string[];
try {
    categoryFolders = await getDirectories(sourceFolder)
} catch (e) {
    console.error("Invalid folder given.");
    process.exit(2);
}

interface Category {
    displayName: string;
    slug: string;
    sourceFolder: string;
    posts: Post[];
}

interface Post {
    title: string;
    slug: string;
    date: string;
    sourceFolder: string;
    category: Category;
}

let categories = categoryFolders.map((cf): Category => {
    let si = cf.lastIndexOf("(");
    let ei = cf.lastIndexOf(")");
    let slug: string;
    let displayName: string;
    if (si == -1 && ei == -1) {
        return {
            displayName: cf,
            slug: cf.replaceAll(/\s/g, '-').toLowerCase(),
            sourceFolder: cf,
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
            sourceFolder: cf,
            posts: []
        }
    }
});

let posts: Post[] = [];
for (const category of categories) {
    let postFolders = await getDirectories(path.join(sourceFolder, "/", category.sourceFolder));
    category.posts = postFolders.map((folder): Post => {
        let si = folder.lastIndexOf("(");
        let ei = folder.lastIndexOf(")");
        let slug: string;
        let displayName: string;
        if (si == -1 && ei == -1) {
            return {
                title: folder,
                slug: folder.replaceAll(/\s/g, '-').toLowerCase(),
                sourceFolder: path.join(category.sourceFolder, "/", folder),
                category: category,
                date: "",
            }
        } else {
            let spaceI = folder.lastIndexOf(' ');
            if (si == -1 || ei == -1 || spaceI == -1 || si > ei || spaceI > ei) {
                console.log("Invalid post directory name:", folder);
                process.exit(4)
            }
            // todo add no slug and only date option
            return {
                title: folder.slice(0, si).trimEnd(),
                slug: folder.slice(si + 1, spaceI).trimEnd(),
                date: folder.slice(spaceI + 1, ei),
                sourceFolder: path.join(category.sourceFolder, "/", folder),
                category: category
            }
        }
    });

    posts.push(...category.posts)
}

console.log(categories)
console.log(posts)