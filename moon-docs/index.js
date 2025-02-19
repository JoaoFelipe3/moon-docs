const notes = {
    "󰁖": "Comparison function, i.e. `a●b●c` ⟶ `a●b∧b●c`",
    "󰁢": "Capital letter modifiers work differently",
    "󰁌": "Right-associative",
    "󰁘": "Calls itself when nullary",
};

const hoverComments = {
    "󰤱": "todo",
    "󷹇": "note",
};

const signatureComments = {
    "∧": "left and right",
    "⩚": "left and right, unary curries into modifier",
    "∨": "left or right or both",
    "󷺤": "left or right but not both",
    "􊽨": "optional modifier",
    "􋅂": "optional modifer, gets curried",
    ".": "only prefix/suffix",
    "𝚡": "value",
    "𝚢": "value",
};

/** @type {String} */
const styles = await(await fetch("style.json")).json();

function highlightHelper(string, isCode, isSignature) {
    const result = document.createElement("span");

    if (isCode) {
        result.className = "code";
        string = string.slice(1, -1);
    };

    for (const char of string) {
        const container = document.createElement("span"); // Styling :sob:
        if (!/\s/.test(char)) container.className = "container";
        const element = document.createElement("span");
        container.appendChild(element);
        element.innerText = char;

        if (char in signatureComments && isSignature) element.title = signatureComments[char];
        if (char in hoverComments) element.title = hoverComments[char];

        for (const [key, style] of Object.entries(styles)) {
            if (key.includes(char)) {
                for (let [property, value] of Object.entries(style)) {
                    property = property.replaceAll(/[A-Z]/g, l => "-" + l.toLowerCase());
                    element.style[property] = value;
                }
                break;
            }
        }

        result.appendChild(container);
    }

    return result;
}

function highlight(string, isSignature) {
    const splitted = string.split(/(`.*?`)/);
    const highlights = splitted.map(string => highlightHelper(string, /^`.*`$/g.test(string), isSignature));
    const span = document.createElement("span");
    span.append(...highlights);
    return span;
}

/** @param {string} description */
function formatFirstLine(glyphs, description) {
    return glyphs
        .map((glyph, index) => glyph + ": " + description.replaceAll(/{(.*?)}/g, (_, c) => c.split(",")[index]))
        .join("\n ");
}

let docs = await(await fetch("operators.txt")).text();

docs = docs.replaceAll(/\n>.*$/gm, "");
docs = docs.replaceAll(/^[^\s].*$/gm, "\n$&");
docs = docs.slice(1);
docs = docs.split("\n\n");

const list = document.querySelector("#docs");
const search = new URLSearchParams(document.location.search).get("q");
if (search) {
    document.title += " - " + search;
    const pre = document.createElement("pre");
    pre.appendChild(highlight(search, false));
    pre.innerHTML = "You searched for: " + pre.innerHTML
    list.insertAdjacentElement("beforebegin", pre);
}

for (const item of docs) {
    if (search && !item.toLowerCase().includes(search.toLowerCase())) continue;

    let [firstLine, ...rest] = item.split("\n");
    rest = rest.length ? rest.join("\n") : null;

    if (firstLine.match(/^\s*$/)) {
        if (!rest) continue;
        [firstLine, ...rest] = rest.split("\n");
        rest = rest.join("\n");
    }

    const li = document.createElement("li");
    const pre = document.createElement("pre");

    firstLine = firstLine.split(" ").slice(1);
    firstLine = firstLine.join(" ");
    let components = firstLine.split("\u2009");
    let glyphs = [...components[0]];
    rest ||= "";
    if (glyphs[glyphs.length - 1] in notes) {
        rest = "    " + notes[glyphs.pop()] + "\n" + rest;
    }
    firstLine = " " + formatFirstLine(glyphs, components[3]);

    let signature = components[1] !== " " ? components[1] : null;

    firstLine = highlight(firstLine, false);
    pre.appendChild(firstLine);
    li.appendChild(pre);

    if (rest || signature) {
        rest = highlight("\n" + rest);
        rest.className = "rest";
        if (signature) {
            let highlightedSignature = highlight("    Signature: `" + signature + "`", true);
            rest.prepend(highlightedSignature);
        }
        rest.style.display = "none";
        pre.appendChild(rest);

        const button = document.createElement("button");
        button.className = "show-hide";
        button.innerText = "🮦";
        button.onclick = () => {
            rest.style.display = rest.style.display === "none" ? "block" : "none";
            button.innerText = button.innerText === "🮦" ? "🮧" : "🮦";
        };
        li.prepend(button);
    } else {
        const indent = document.createElement("span");
        indent.innerText = " ";
        pre.prepend(indent);
    }
    list.appendChild(li);
}