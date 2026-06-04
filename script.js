const submitBtn = document.getElementById("submitBtn");
const wordInput = document.getElementById("wordInput");
const message = document.getElementById("message");

submitBtn.addEventListener("click", () => {

    const word = wordInput.value.trim();

    if (!word) {
        message.innerText = "Please enter a word";
        return;
    }

    message.innerText = `You entered: ${word}`;

});
