const hoverComments = {
    "󰤱": "todo",
    "󷹇": "note from ganer",
    "󰷬": "note from joaozin003",
};

const signatureComments = {
    "∧": "left and right",
    "⩚": "left and right, unary curries into modifier",
    "∨": "left or right or both",
    "󷸐": "left or both",
    "󷺤": "left or right but not both",
    "􊽨": "optional modifier",
    "􋅂": "optional modifier, gets curried",
    ".": "only prefix/suffix",
    "𝚡": "value",
    "𝚢": "value",
};

/** @type {String} */
const styles = await (await fetch("style.json")).json();

function highlightHelper(string, { isCode, isSignature, displayNotes }) {
    const result = document.createElement("span");

    if (isCode) {
        result.className = "code";
        string = string.slice(1, -1);
    };

    for (const char of string) {
        const container = document.createElement("span"); // Styling 😭
        if (!/\s/.test(char)) container.className = "container";
        const element = document.createElement("span");
        container.appendChild(element);
        element.innerText = char;

        const tooltip = document.createElement("p");
        tooltip.className = "tooltip";
        if (char in hoverComments && displayNotes) tooltip.innerText = hoverComments[char];
        if (char in signatureComments && isSignature) tooltip.innerText = signatureComments[char];
        if (tooltip.innerText) container.appendChild(tooltip);

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

export default function highlight(string, flags = {}) {
    const splitted = string.split(/(`.*?`)/);
    const highlights = splitted.map(string => highlightHelper(string, { isCode: flags.hasCode && /^`.*`$/g.test(string), ...flags }));
    const span = document.createElement("span");
    span.append(...highlights);
    return span;
}
