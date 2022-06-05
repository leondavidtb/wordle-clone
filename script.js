document.addEventListener("DOMContentLoaded", () => {
  createSquares();
  getNewWord();

  let availableSpace = 1;
  let guessedWords = [[]];
  let word;
  let guessedWordCount = 0;

  const keys = document.querySelectorAll(".keyboard-row button");

  function getNewWord() {
    fetch(
      `https://wordsapiv1.p.rapidapi.com/words/?random=true&lettersMin=5&lettersMax=5`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
          "x-rapidapi-key": "<YOUR_API>",
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        word = res.word;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function getCurrentWordArray() {
    const numberOfGuessedWords = guessedWords.length;

    return guessedWords[numberOfGuessedWords - 1];
  }

  function updateGuessedWords(letter) {
    const currentWordArray = getCurrentWordArray();

    if (currentWordArray && currentWordArray.length < 5) {
      currentWordArray.push(letter);

      const availableSpaceElement = document.getElementById(
        String(availableSpace)
      );
      availableSpace = availableSpace + 1;

      availableSpaceElement.textContent = letter;
    }
  }

  function createSquares() {
    const gameBoard = document.getElementById("board");

    for (let index = 0; index < 30; index++) {
      let square = document.createElement("div");
      square.classList.add("square");
      square.classList.add("animate__animated");
      square.setAttribute("id", index + 1);
      gameBoard.appendChild(square);
    }
  }

  function getTileColor(letter, index) {
    const isCorrectLetter = word.includes(letter);
    const letterInThatPosition = word.charAt(index);
    const isCorrectPosition = letter === letterInThatPosition;

    if (!isCorrectLetter) {
      return "rgb(58, 58, 60)";
    }

    if (isCorrectPosition) {
      return "rgb(83, 141, 78)";
    }

    return "rgb(181, 159, 59)";
  }

  function handleSubmitWord() {
    const currentWordArray = getCurrentWordArray();
    const currentWord = currentWordArray.join("");

    if (currentWordArray.length !== 5) {
      window.alert("Word must be 5 letters!");
    }

    fetch(`https://wordsapiv1.p.rapidapi.com/words/${currentWord}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
        "x-rapidapi-key": "<YOUR_API>",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw Error();
        }

        const firstLetterId = guessedWordCount * 5 + 1;
        const interval = 500;

        currentWordArray.forEach((letter, index) => {
          setTimeout(() => {
            const tileColor = getTileColor(letter, index);
            const letterId = firstLetterId + index;
            const letterElement = document.getElementById(letterId);
            letterElement.classList.add("animate__flipInX");
            letterElement.style = `background-color: ${tileColor}; border-color: ${tileColor}; animation-timing-function: linear;`;
          }, interval * index);
        });

        guessedWordCount += 1;

        if (currentWord === word) {
          window.alert("You win!");
        }

        if (guessedWords.length === 6) {
          window.alert(`You lost. The word is ${word}`);
        }

        guessedWords.push([]);
      })
      .catch(() => {
        window.alert("Word not accepted!");
      });
  }

  function handleDeleteLetter() {
    const currentWordArray = getCurrentWordArray();

    currentWordArray.pop();

    guessedWords[guessedWords.length - 1] = currentWordArray;

    const lastLetterElement = document.getElementById(
      String(availableSpace - 1)
    );

    lastLetterElement.textContent = "";
    availableSpace = availableSpace - 1;
  }

  for (let i = 0; i < keys.length; i++) {
    keys[i].onclick = ({ target }) => {
      const letter = target.getAttribute("data-key");

      if (letter === "enter") {
        handleSubmitWord();

        return;
      }

      if (letter === "del") {
        handleDeleteLetter();

        return;
      }

      updateGuessedWords(letter);
    };
  }
});
