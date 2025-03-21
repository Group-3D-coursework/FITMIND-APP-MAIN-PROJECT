document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.querySelector("#menu-icon");
    const menuBox = document.querySelector("#menu-box");
    const body = document.querySelector("body");

    menuBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        menuBox.classList.toggle("active");
        menuBtn.classList.toggle("pushed");
        body.classList.toggle("overlay-active");
    });

    document.addEventListener("click", function (event) {
        if (!menuBox.contains(event.target) && !menuBtn.contains(event.target)) {
            menuBox.classList.remove("active");
            menuBtn.classList.remove("pushed");
            body.classList.remove("overlay-active");
        }
    });
});
