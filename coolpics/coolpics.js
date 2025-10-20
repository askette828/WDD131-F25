const menuButton = document.querySelector(".menu-button");
const navMenu = document.querySelector(".header ul");

// this funct will hide the menu at small screen
function handleResize() {
    if (window.innerWidth > 1000) {
        navMenu.classList.remove("hide");
    } else {
        navMenu.classList.add("hide");
    }
}

menuButton.addEventListener("click", () => {
    navMenu.classList.toggle("hide");
});

window.addEventListener("resize", handleResize);
window.addEventListener("load", handleResize);

//point 08 for viewing image
function viewerTemplate(picPath, altText) {
    return `
    <div class="viewer">
      <button class="close-viewer">X</button>
      <img src="${picPath}" alt="${altText}">
    </div>`;
}

function viewHandler(event) {
    const clicked = event.target;
    if (clicked.tagName === "IMG") {
        const viewerHTML = viewerTemplate("norris-full.jpeg", clicked.alt);
        document.body.insertAdjacentHTML("afterbegin", viewerHTML);
        document
            .querySelector(".close-viewer")
            .addEventListener("click", () => {
                document.querySelector(".viewer").remove();
            });
    }
}

document.querySelector(".image-grid").addEventListener("click", viewHandler);