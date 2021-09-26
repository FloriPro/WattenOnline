var ws = new WebSocket("ws://192.168.1.14:8000/");

var cards = [];

ws.onmessage = function(event) {
  console.log(event.data)
  if (event.data.substring(0, 2) == "PL") {
    p = event.data.substring(2, 0);

    document.getElementById("waitingPlayer").innerHTML = "Vorhandene Spieler: " + event.data.substring(2, 3)
  }
  if (event.data.substring(0, 3) == "Sel") {
    document.getElementById("waiting").style.display = "none";
    document.getElementById("game").style.display = "block";
  }
  if (event.data.substring(0, 3) == "IT:") {
    event.data.substring(3, 999).split("#").forEach(function(item, index, array) {
      cards.push(item)
      document.getElementById("yourCards").innerHTML += '<img alt="' + item + '" src="/deck/own/' + item + '.png" width="25%" height="25%">';
    });
  }
};

function init(pos) {
  ws.send(pos);
  document.getElementById("position").style.display = "none";
  document.getElementById("waiting").style.display = "block";
}

function genImg(cards) {

}