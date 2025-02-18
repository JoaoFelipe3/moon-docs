const notes = {
    "󰁖": "Comparison function, i.e. `a●b●c` ⟶ `a●b∧b●c`",
    "󰁢": "Capital letter modifiers work differently",
    "󰁌": "Right-associative",
    "󰁘": "Calls itself when nullary",
};

/** @type {String} */
const styles = await(await fetch("style.json")).json();

function highlightHelper(string, isCode) {
    const result = document.createElement("span");

    if (isCode) {
        result.className = "code";
        string = string.slice(1, -1);
    };

    for (const char of string) {
        const element = document.createElement("span");
        element.innerText = char;

        for (const [key, style] of Object.entries(styles)) {
            if (key.includes(char)) {
                for (let [property, value] of Object.entries(style)) {
                    property = property.replaceAll(/[A-Z]/g, l => "-" + l.toLowerCase());
                    element.style[property] = value;
                }
                break;
            }
        }

        result.appendChild(element);
    }

    return result;
}

function highlight(string) {
    const splitted = string.split(/(`.*?`)/);
    const highlights = splitted.map(string => highlightHelper(string, /^`.*`$/g.test(string)));
    const span = document.createElement("span");
    span.append(...highlights);
    return span;
}

/** @param {string} description */
function formatFirstLine(glyphs, description) {
    return glyphs
        .map((glyph, index) => glyph + ": " + description.replaceAll(/{(.*?)}/g, (_, c) => c.split(",")[index]))
        .join("\n  ");
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
    pre.appendChild(highlight(search));
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
    if (Object.keys(notes).join("").includes(glyphs[glyphs.length - 1])) {
        rest = "    " + notes[glyphs.pop()] + "\n" + rest;
    }
    firstLine = " " + formatFirstLine(glyphs, components[3]);

    if (components[1] !== " ")
        rest = "    Signature: `" + components[1] + "`\n" + rest;

    firstLine = highlight(firstLine);
    pre.appendChild(firstLine);
    li.appendChild(pre);

    if (rest) {
        rest = highlight("\n" + rest);
        rest.style.display = "none";
        pre.appendChild(rest);

        const button = document.createElement("button");
        button.className = "show-hide";
        button.innerText = "🮦";
        button.onclick = () => {
            rest.style.display = rest.style.display === "none" ? "inline" : "none";
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