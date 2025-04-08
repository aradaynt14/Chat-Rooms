// main.js

let ws;
let username;

function setUsername(name){
    username = name;
}
// Refresh room list
window.onload = getRoomCodes;

function newRoom() {
    // Calling the ChatServlet to retrieve a new room ID
    let callURL = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(response => parseCode(response)); // enter the room with the code
}

function parseCode(code) {
    storeRoomCode(code);
    enterRoom(code);
    //sending username
    let messageContent = username;

    console.log("ws:", ws);
    console.log("Message content:", messageContent);
    let request = { "type": "chat", "msg": messageContent };
    console.log("Sending message:", request);
    ws.onopen = () => ws.send(JSON.stringify(request))
    console.log("TESTING: " + messageContent)
    // ws.send(JSON.stringify(request));
    console.log("ws : " + ws);
}

function enterInput() {
    let value = document.getElementById("room-code-input").value;
    if (value != null && value !== "" && value !== undefined) {
        enterRoom(value);
        //store to RoomListJava
        // storeRoomCode(value);
    }
}

function enterRoom(code) {
    if (ws != null) {
        console.log("CLOSING PREVIOUS WEBSOCKET CONNECTION");
        ws.close();
    }

    // Refresh the list of rooms
    // Create the web socket
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + code);

    // Parse messages received from the server and update the UI accordingly
    ws.onmessage = function (event) {
        console.log("Message received from server:", event.data);
        try {
            let message = JSON.parse(event.data);
            console.log("Parsed message:", JSON.stringify(message));
            document.getElementById("log").value += "[" + timestamp() + "] " + message.message + "\n";
        } catch (error) {
            console.error("Error parsing message:", error);
        }
    }
    // Function to send a message
}

function sendMessage() {
    let messageContent = document.getElementById("input").value;
    console.log("ws:", ws);
    console.log("Message content:", messageContent);
    let request = { "type": "chat", "msg": messageContent };
    console.log("Sending message:", request);
    ws.send(JSON.stringify(request));
    console.log("ws : " + ws);
    document.getElementById("input").value = "";
}

// Event listener for the "Enter" key
document.getElementById("input").addEventListener("keyup", function (event) {
    console.log("Key pressed:", event.key);
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Event listener for the "Send" button
document.getElementById("send-button").addEventListener("click", function () {
    sendMessage();
});

function timestamp() {
    let d = new Date(), minutes = d.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return d.getHours() + ':' + minutes;
}

function openRoomTab() {
    let tab = document.getElementById("room-tab");
    tab.style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeRoomTab() {
    document.getElementById("room-tab").style.width = "0px";
    document.getElementById("main").style.marginLeft = "0px";
}

function storeRoomCode(code) {
    fetch("http://localhost:8080/WSChatServer-1.0-SNAPSHOT/room-list", {
        method: "POST",
        body: code.toString(),
        headers: {
            "Content-type": "text/plain"
        }
    });
    getRoomCodes();
}

function getRoomCodes() {
    // Calling the ChatServlet to retrieve a new room ID
    let callURL = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/room-list";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(response => refreshRoomList(response));
}

function refreshRoomList(code) {
    console.log(code);
    let codes = code.split('\n');
    codes.pop(); // Remove extra newline
    let roomListRef = document.getElementById("room-list");
    roomListRef.innerHTML = "";
    for (let c in codes) {
        let codeI = codes[c].replace(/(\r\n|\n|\r)/gm, ""); // Removes newline char
        console.log(codeI);

        let liElement = document.createElement("li");
        liElement.className = "text";

        let button = document.createElement("button");
        button.innerHTML = codeI;

        button.setAttribute("id", codeI)
        function onClick() {
            enterRoom(codeI)
        }
        button.addEventListener("click", onClick, false)

        liElement.appendChild(button);
        roomListRef.appendChild(liElement);
    }
}

function toggleEmojiDropdown() {
    var dropdownContent = document.getElementById("emoji-dropdown");
    dropdownContent.classList.toggle("show");
}

document.getElementById("emoji-button").addEventListener("click", function () {
    toggleEmojiDropdown();
});

var emojiOptions = ["😀", "😁", "😂", "😃", "😄", "😅", "😆", "😇", "😈", "😉", "😊", "😋"];
var emojiDropdown = document.getElementById("emoji-dropdown");
emojiOptions.forEach(function (emoji) {
    var emojiButton = document.createElement("button");
    emojiButton.textContent = emoji;
    emojiButton.onclick = function () {
        insertEmoji(emoji);
    };
    emojiDropdown.appendChild(emojiButton);
});

function insertEmoji(emoji) {
    var inputField = document.getElementById("input");
    var cursorPosition = inputField.selectionStart;
    var inputValue = inputField.value;
    var newValue = inputValue.substring(0, cursorPosition) + emoji + inputValue.substring(cursorPosition);
    console.log("New value:", newValue);
    inputField.value = newValue;
    inputField.focus();
    inputField.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
}
