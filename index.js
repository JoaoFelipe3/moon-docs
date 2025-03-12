import highlight from "/highlight.js";

const notes = {
    "󰁖": "Comparison function, i.e. `a●b●c` ⟶ `a●b∧b●c`",
    "󰁢": "Capital letter modifiers work differently",
    "󰁌": "Right-associative",
    "󰁘": "Calls itself when nullary",
};

/** @param {string} description */
function formatFirstLine(glyphs, description) {
    return glyphs
        .map((glyph, index) => glyph + ": " + description.replaceAll(/{(.*?)}/g, (_, c) => c.split(",")[index]))
        .join("\n ");
}

let docs = await (await fetch("operators.txt")).text();

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
    if (glyphs[glyphs.length - 1] in notes) {
        let note = notes[glyphs.pop()];
        rest = "    " + note + "\n" + rest;
    }
    firstLine = " " + formatFirstLine(glyphs, components[3]);

    let signature = components[1] !== " " ? components[1] : null;

    firstLine = highlight(firstLine, {});
    pre.appendChild(firstLine);
    li.appendChild(pre);

    if (rest || signature) {
        rest = highlight(rest, { displayNotes: true, hasCode: true });
        rest.className = "rest";
        if (signature) {
            let highlightedSignature = highlight("    Signature: `" + signature + "`\n", { isSignature: true });
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