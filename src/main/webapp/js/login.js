let username;
document.getElementById("login").addEventListener("click", function () {
    let name = document.getElementById("username").value;
    console.log(name);
    setUsername(name);
    username = name
    window.location.href = "chatRoom.html";
});
