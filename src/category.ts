import {Post} from "./post.js";

export interface Category {
    displayName: string;
    slug: string;
    sourceFolder: string;
    posts: Post[];
}