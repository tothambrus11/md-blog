## blog-sources
This is the folder where you can edit your content. The subfolders are categories, and the sub-subfolders are posts.

Name these folders as you want but do not include `$variable-names$` that are used in the generator templates, because the generators may replace them as well.

Once you named your folders, you can start generating content via `npm run edit-dev`. This will start the nodejs script that...

1. renames your source folders to include an identifier (slug), and for your posts, their date of creation (based on unix timestamp).
2. generates a static html/css/js site into the configured output directory (by default to `dist/dev`)

It also auto-reloads when detects file changes. (If it doesn't notice something, you can search for nodemon, and add the paths or extensions to the command).

## A Post Folder
A post folder has to contain a `post.md` file. This will be transpiled to html by the generator program, and some custom stuff is also added in this step.
You can save images, scripts, styles to this folder as well, and you can include them using relative urls in your markdown file.

## src
This is the source of the generator script. It contains all the templates, generators that produce the final output (you should edit these to match your design), but also the source reading script. Open `src/main.ts` to get started.

## src/config.ts
This is a config file that contains some information about where you keep your post
source files, where you want to export them, and what should be 
the base url of the page. These properties are defined for 
development and production use as well, the main script will 
choose between them depending on whether you supplied the "--prod"
command line argument when starting - or whether you used the 
`edit-dev` npm script or the `edit-build-prod` npm script.

## public-project
This is a helper project that contains some javascript imports from npm, and will be bundled and exported to the src/assets folder, so that the static html page can use those libraries. You probably don't need to touch this.

## dist
Generated output directory
