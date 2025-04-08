function rollDice() {
  const result = Math.floor(Math.random() * 6) + 1;
  window.alert("Dice Roll Result: " + result)
}

function flipCoin() {
  const result = Math.random() < 0.5 ? 1 : 2; 
  const outcome = result === 1 ? "Heads" : "Tails";
  window.alert("Coin Flip Result: " + outcome)
}

function displayNotification(message) {
  document.getElementById("notification").innerHTML = "";
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.padding = "10px";
  notification.style.border = "1px solid #ccc";
  notification.style.borderRadius = "5px";
  notification.style.marginBottom = "10px";
  document.getElementById("notification").appendChild(notification);
}
