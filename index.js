import highlight from "/highlight.js";

const notes = {
    "󰁖": "Comparison function, i.e. `a●b●c` ⟶ `a●b∧b●c`",
    "󰁌": "Right-associative",
    "󰁘": "Calls itself when nullary",
};

/** @param {string} description */
function formatFirstLine(glyphs, description) {
    return glyphs
        .map((glyph, index) => glyph + ": " + description.replaceAll(/{(.*?)}/g, (_, c) => c.split(",")[index]))
        .join("\n  ");
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
    const details = document.createElement("details");

    firstLine = firstLine.split(" ").slice(1);
    firstLine = firstLine.join(" ");
    let components = firstLine.split("\u2009");
    let glyphs = [...components[0]];
    rest ||= "";
    if (glyphs[glyphs.length - 1] in notes) {
        const note = notes[glyphs.pop()];
        console.log(note);
        rest = "    " + note + "\n" + rest;
    }
    firstLine = " " + formatFirstLine(glyphs, components[3]);

    let signature = components[1] !== " " ? components[1] : null;

    firstLine = highlight(firstLine, {});
    let summary = document.createElement("summary");
    summary.appendChild(firstLine);
    details.appendChild(summary);
    li.appendChild(details);

    if (rest || signature) {
        rest = highlight(rest, { displayNotes: true, hasCode: true });
        if (signature) {
            let highlightedSignature = highlight("    Signature: `" + signature + "`\n", { hasCode: true, isSignature: true });
            rest.prepend(highlightedSignature);
        }
        details.appendChild(rest);
    } else {
        summary.className = "no-dropdown";
    }
    list.appendChild(li);
}
