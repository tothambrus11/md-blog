import {Category} from "./category.js";

export interface Post {
    title: string;
    slug: string;
    date: string;
    sourceFolder: string;
    category: Category;
}