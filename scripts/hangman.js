const counter = document.getElementById("counter");

let intialTries = 10;

function refreshCount() {
    counter.textContent = intialTries.toString();
}

refreshCount();