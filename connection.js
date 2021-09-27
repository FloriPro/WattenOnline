function getCookie(name) {
  var dc,
    prefix,
    begin,
    end;
  dc = document.cookie;
  prefix = name + "=";
  begin = dc.indexOf("; " + prefix);
  end = dc.length;
  if (begin !== -1) {
    begin += 2;
  } else {
    begin = dc.indexOf(prefix);
    if (begin === -1 || begin !== 0) return null;
  }
  if (dc.indexOf(";", begin) !== -1) {
    end = dc.indexOf(";", begin);
  }
  return decodeURI(dc.substring(begin + prefix.length, end)).replace(/\"/g, '');
}

function neueIp() {
  document.cookie = "serverIpAdress=" + prompt("Ip adress:") + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
  ws = new WebSocket("ws://" + getCookie("serverIpAdress") + ":8000/");
}

if (getCookie("serverIpAdress") == null) {
  document.cookie = "serverIpAdress=" + prompt("Ip adress:") + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
}

var ws;

window.addEventListener('load', function() {
  ws = new WebSocket("ws://" + getCookie("serverIpAdress") + ":8000/");


  var cards = [];

  ws.onopen = function(event) {
    console.log("ok");
    document.getElementById("position").style.display = "inline-table";
    document.getElementById("startingConnection").style.display = "none";
    document.getElementById("NeueIP").style.display = "none";
  }

  ws.onerror = function(event) {
    if (document.getElementById("startingConnection").style.display != "none") {

      document.getElementById("startingConnection").textContent = "Verbindung fehlgeschlagen";
    }

  }

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

});

function init(pos) {
  ws.send(pos);
  document.getElementById("position").style.display = "none";
  document.getElementById("waiting").style.display = "block";
}