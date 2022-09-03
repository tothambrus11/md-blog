import {Renderer, Slugger} from "marked";
import a from "./helpers.js";
import katex from 'katex';

const escape = a.escape;
const cleanUrl = a.cleanUrl;
const supportedCodeLanguages = ["css", "javascript", "js", "ts", "clike", "html", "java", "markup", "typescript", "sass", "scss", "math", "p5js"]

export function renderer(baseUrl: string): Renderer {
    return {
        options: {},
        code(code: string, infostring: string, escaped: boolean) {

            // @ts-ignore
            let lang = (infostring || '').match(/\S*/)[0].trim();
            if (supportedCodeLanguages.indexOf(lang) == -1) {
                lang = "";
            }

            if (lang == "math") {
                return katex.renderToString(code, {
                    displayMode: true,
                    strict: "warn"
                });
            }

            if (lang == "p5js") {
                let fileName = "";
                if (code.startsWith("//")) {
                    let c;
                    for (c = 2; c < code.length; c++) {
                        if (code.charAt(c) == "\n") {
                            break;
                        } else {
                            fileName += code.charAt(c);
                        }
                    }
                    fileName = fileName.trim();
                    code = code.substr(Math.min(c + 1, code.length - 1));
                }

                // @ts-ignore
                let highlightedCode = this.options.highlight!(code, "js") || code;

                if (!fileName) {
                    fileName = "main.js";
                }

                let hashed = hash(code);
                console.log(hashed)

                let content = '<!DOCTYPE html><html><head><script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.3.1/p5.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.3.1/addons/p5.sound.min.js"></script><meta charset="utf-8" /><style>html,body{margin:0;padding:0;overflow:hidden} canvas{display: block}</style></head><body>'
                content += "<script>"
                content += code.replaceAll('<script>', '\\x3Cscript>').replaceAll('</script>', '\\x3C/script>')
                content += "</script></body></html>";

                content = JSON.stringify(content).replaceAll("</script>", '</scr"+"ipt>'); // wtf


                return `<div class="p5js-container" id="p5js-container-${hashed}">
    <div class="p5ch">
        <div>
            <button class="filename active"><img src="${baseUrl}assets/js.svg" width="16" height="16"><span>${escape(fileName)}</span>
            </button>
        </div>
        <div>
            <button class="fullscreen"><img src="${baseUrl}assets/fullscreen.svg" width="16" height="16"
                                            title="full screen"></button>
            <button class="run">Run<img src="${baseUrl}assets/run.svg" height="16" width="16"></button>
            <button class="stop">Stop<img src="${baseUrl}assets/stop.svg" height="16" width="16"></button>
        </div>
    </div>
    <pre style="margin-top:0"><code class="${
                    // @ts-ignore 
                    this.options.langPrefix}js">${highlightedCode}</code></pre>
    <div class="iframe-cont"></div>
</div>

<script>
{
    let container = document.getElementById("p5js-container-${hashed}");
    console.log(container, "${hashed}")
    let iframeCont = container.getElementsByClassName("iframe-cont")[0];
    const run = container.getElementsByClassName("run")[0];
    const stop = container.getElementsByClassName("stop")[0];
    const filename = container.getElementsByClassName("filename")[0];

    closeRunningWindow();

    function closeRunningWindow() {
        container.classList.add("display-code");
        container.classList.remove("display-run");

        iframeCont.innerHTML = "";
    }

    stop.addEventListener("click", () => closeRunningWindow());
    filename.addEventListener("click", () => closeRunningWindow());

    run.addEventListener("click", () => {
        container.classList.remove("display-code");
        container.classList.add("display-run");

        let iframe = document.createElement("iframe");
        iframe.src = "about:blank";

        iframeCont.innerHTML = "";
        iframeCont.append(iframe);

        iframe.contentDocument.open("about:blank");
        iframe.contentDocument.write(${content});
        iframe.contentDocument.close();
    });
    
    container.getElementsByClassName("fullscreen")[0].addEventListener("click", () => {
        let iframe = container.getElementsByTagName("iframe")[0];
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) { /* Safari */
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) { /* IE11 */
            iframe.msRequestFullscreen();
        }
        iframe.requestFullscreen({navigationUI: "show"})
    });
}
</script>`;
            }

            if (!lang) {
                return '<pre><code>'
                    + (escaped ? code : escape(code, true))
                    + '</code></pre>\n';
            } else {
                // @ts-ignore
                return `<pre><code class="${this.options.langPrefix + lang}">${this.options.highlight!(code, lang)}</code></pre>`;
            }
        },

        blockquote(quote: string) {
            return `<blockquote>${quote}</blockquote>`;
        },

        html(html: string) {
            return html;
        },

        heading(text: string, level: number, raw: string, slugger: Slugger) {
            // @ts-ignore
            if (this.options.headerIds) {
                // @ts-ignore
                return `<h${level} id="${this.options.headerPrefix}${slugger.slug(raw)}">${text}</h${level}>`;
            }
            // ignore IDs
            return `<h${level}>${text}</h${level}>`;
        },

        hr() {
            // @ts-ignore
            return this.options.xhtml ? '<hr/>' : '<hr>';
        },

        list(body, ordered, start) {
            const type = ordered ? 'ol' : 'ul'
            const startatt = (ordered && start !== 1) ? (` start="${start}"`) : '';
            return `<${type}${startatt}>${body}</${type}>`;
        },

        listitem(text: string) {
            return '<li>' + text + '</li>\n';
        },

        checkbox(checked: boolean) {
            return `<input ${checked ? `checked="" ` : ''}type="checkbox" />`;
        },

        paragraph(text: string) {
            if (text.startsWith("<centertext")) return text + "\n";
            return '<p>' + text + '</p>';
        },

        table(header, body) {
            if (body) body = `<tbody>${body}</tbody>`;

            return `<table><thead>${header}</thead>${body}</table>`;
        },

        tablerow(content: string) {
            return '<tr>' + content + '</tr>';
        },

        tablecell(content, flags) {
            const type = flags.header ? 'th' : 'td';
            const tag = flags.align
                ? '<' + type + ' align="' + flags.align + '">'
                : '<' + type + '>';
            return tag + content + '</' + type + '>\n';
        },

        // span level renderer
        strong(text) {
            return '<strong>' + text + '</strong>';
        },

        em(text) {
            return '<em>' + text + '</em>';
        },

        codespan(text) {
            return '<code class="codespan">' + text + '</code>';
        },

        br() {
            // @ts-ignore
            return this.options.xhtml ? '<br/>' : '<br>';
        },

        del(text) {
            return '<del>' + text + '</del>';
        },

        link(href, title, text) {
            // @ts-ignore
            href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
            if (href === null) {
                return text;
            }

            let out = '<a href="' + escape(href) + '"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += '>' + text + '</a>';
            return out;
        },

        image(href, title, alt) {
            // @ts-ignore
            href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
            if (href === null) {
                return alt;
            }

            let out = '<img src="' + href + '" alt="' + alt + '"';

            let titleParts = (title && title.split(/\s+/)) || [];
            let realTitle: string[] = [];
            let classNames: string[] = [];
            let m: RegExpMatchArray | null;

            for (const w of titleParts) {
                if ((m = w.match(/^([\d*]+)x([\d*]+)$/))) {
                    if (m[1] == "*") {
                        out += ` height="${Number(m[2])}"`;
                    } else if (m[2] == "*") {
                        out += ` width="${Number(m[1])}"`;
                    } else {
                        out += ' width="' + m[1] + '" height="' + m[2] + '"'
                    }
                } else if ((m = w.match(/^(\w+)=([\w-]+)$/))) {
                    if (m[1] === 'class') {
                        classNames.push(m[2]);
                    } else {
                        out += ' ' + m[1] + '="' + m[2] + '"';
                    }
                } else if (m = w.match(/^\.([\w-]+)$/)) {
                    classNames.push(m[1]);
                } else if (w) realTitle.push(w);
            }

            if (classNames.length) {
                out += ' class="' + classNames.join(' ') + '"';
            }

            title = realTitle.join(' ');

            if (title) {
                out += ' title="' + title + '"';
            }

            // @ts-ignore
            out += this.options.xhtml ? '/>' : '>';
            return out;
        },

        text(text) {
            return text;
        }
    }
}

function hash(input: string) {
    let hash = 0, i, chr;
    if (input.length === 0) return hash;
    for (i = 0; i < input.length; i++) {
        chr = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
