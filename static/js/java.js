function targetTextToConsole(event) {
    //event.target(event);
    //console.log(event);
    event.textContent = 'hi';
    console.log("hi");
}

function tttcAttacher() {
    const event = document.querySelector('#username');
    event.addEventListener('change', targetTextToConsole);
}