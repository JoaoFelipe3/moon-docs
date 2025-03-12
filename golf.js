import highlight from "/highlight.js";

const input = document.querySelector("#golf-input");
const overlay = document.querySelector("#golf-overlay");
const explanation = document.querySelector("#explanation");
const explanationContent = document.querySelector("#explanation-content");
const palette = document.querySelector("#palette");

function createExplanationLine(a, b) {
    if (b < a) [a, b] = [b, a];

    const nestedSpan = palette.firstChild.firstChild;
    const charRange = [...nestedSpan.childNodes].slice(a, b + 1).map(c => c.cloneNode(true));

    const newLine = document.createElement("pre");

    const deleteButton = document.createElement("span");
    deleteButton.className = "show-hide"; // cheating
    deleteButton.innerText = "󰆴";
    deleteButton.addEventListener("click", () => {
        newLine.remove();
    });

    const upButton = document.createElement("span");
    upButton.className = "show-hide";
    upButton.innerText = "󷹗";
    upButton.addEventListener("click", () => {
        if (newLine.matches(":not(:first-child)"))
            newLine.parentElement.insertBefore(newLine, newLine.previousElementSibling);
    });
    const downButton = document.createElement("span");
    downButton.className = "show-hide";
    downButton.innerText = "󷹘";
    downButton.addEventListener("click", () => {
        if (newLine.matches(":not(:last-child)"))
            newLine.parentElement.insertBefore(newLine.nextElementSibling, newLine);
    });

    const commentInput = document.createElement("input");
    commentInput.className = "comment-input";

    newLine.append(
        deleteButton, upButton, downButton,
        " ".repeat(a + 1), ...charRange, " ".repeat(nestedSpan.childNodes.length - b - 1),
        highlight("  "), commentInput
    );
    explanationContent.appendChild(newLine);

    commentInput.focus();
}

let selectedIndex;
input.addEventListener("input", () => {
    overlay.innerHTML = "";
    overlay.appendChild(highlight(input.value));

    explanation.style.display = input.value.split("\n").length == 1 && input.value ? null : "none";
    explanationContent.querySelectorAll(":scope > *:not(#palette)").forEach(e => e.remove());
    palette.innerHTML = overlay.innerHTML;

    const nestedSpan = palette.firstChild.firstChild; // I'm not going to fix this
    selectedIndex = undefined;
    for (const char of nestedSpan.children) char.addEventListener("click", () => {
        const thisIndex = Array.from(nestedSpan.children).indexOf(char);
        if (selectedIndex !== undefined) {
            createExplanationLine(selectedIndex, thisIndex);
            selectedIndex = undefined;
        } else {
            selectedIndex = thisIndex;
        }
    });
});

input.addEventListener("scroll", () => {
    overlay.scrollTop = input.scrollTop;
    overlay.scrollLeft = input.scrollLeft;
});
