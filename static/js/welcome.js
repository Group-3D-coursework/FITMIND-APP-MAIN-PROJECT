document.addEventListener("DOMContentLoaded", function () {
    let progress = 0;
    let interval = setInterval(() => {
        if (progress < 100) {
            progress += 10;
            document.querySelector("#progress-bar").style.width = progress + "%";
        } else {
            clearInterval(interval);
            document.querySelector("#loading-screen").style.display = "none";
            document.querySelector("#welcome-container").style.display = "block";
        }
    }, 100);
});