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

var type = "none";
var ws;
var HauptFar;
var HauptSla;
var posYou = "None";

function wsSend(message) {
  ws.send(message)
}

window.addEventListener('load', function () {
  ws = new WebSocket("ws://" + getCookie("serverIpAdress") + ":8000/");


  var cards = [];

  ws.onopen = function (event) {
    console.log("ok");
    document.getElementById("position").style.display = "inline-table";
    document.getElementById("startingConnection").style.display = "none";
    document.getElementById("NeueIP").style.display = "none";
  }

  ws.onerror = function (event) {
    if (document.getElementById("startingConnection").style.display != "none") {
      console.log(event);
      document.getElementById("startingConnection").textContent = "Verbindung fehlgeschlagen";
    }

  }

  ws.onmessage = function (event) {
    console.log(event.data);
    if (event.data.substring(0, 2) == "PL") {
      p = event.data.substring(2, 0);

      document.getElementById("waitingPlayer").innerHTML = "Vorhandene Spieler: " + event.data.substring(2, 3)
    }
    if (event.data.substring(0, 7) == "YourSel") {
      type = "YourSel"
      document.getElementById("Msg").textContent = "Lege eine Karte:";
      document.getElementById("Msg").style.display = "unset";
    }
    if (event.data.substring(0, 3) == "IT:") {
      document.querySelectorAll(".yourCard").forEach(element => {
        element.remove()
      });

      event.data.substring(3, 999).split("#").forEach(function (item, index, array) {
        cards.push(item)
        document.getElementById("yourCards").innerHTML += '<a class="yourCard" href="#" width="25%" height="25%"><img alt="' + item + '" src="/deck/own/' + item + '.png" id="' + item + '" onclick="cardSelect(\'' + item + '\')"></a>';
      });
      document.getElementById("SticheAnzahl").style.display = "unset";
    }
    if (event.data.substring(0, 2) == "FR") {
      document.querySelectorAll(".posSel").forEach(element => {
        element.style.display = "none";
      });
      if (event.data != "FR_") {
        event.data.substring(3, 999).split("#").forEach(function (item, index, array) {
          document.getElementById(item).style.display = "unset"
        });
      }
    }
    if (event.data.substring(0, 6) == "WaiOnP") {
    }
    if (event.data.substring(0, 5) == "clear") {
      document.getElementById("waiting").style.display = "none";
      document.getElementById("game").style.display = "block";
    }
    if (event.data.substring(0, 7) == "waitSla") {
      document.getElementById("info").style.display = "unset";
      document.getElementById("info").textContent = "Warte auf selection vom Schlag";
    }
    if (event.data.substring(0, 7) == "SelSla") {
      type = "selSla"
      document.getElementById("info").style.display = "unset";
      document.getElementById("info").style.background = "#0dff00"
      document.getElementById("info").textContent = "Bitte Schlag auswählen";
    }
    if (event.data.substring(0, 7) == "waitFar") {
      document.getElementById("info").style.display = "unset";
      document.getElementById("info").textContent = "Warte auf selection von Farbe -- Schlag: " + HauptSla;
    }
    if (event.data.substring(0, 7) == "SelFar") {
      type = "selFar"
      document.getElementById("info").style.display = "unset";
      document.getElementById("info").style.background = "#0dff00"
      document.getElementById("info").textContent = "Bitte Farbe auswählen -- Schlag: " + HauptSla;
    }
    if (event.data.substring(0, 6) == "Stapel") {
      document.getElementById("layedCards").innerHTML = "";
      if (event.data.substring(6, 999) != "") {
        event.data.substring(6, 999).split("#").forEach(function (item, index, array) {
          cards.push(item)
          document.getElementById("layedCards").innerHTML += '<img src="/deck/own/' + item + '.png" width="30%" height="30%" style="margin-right: -20%;" alt="' + item + '">';
        });
      }
    }
    if (event.data.substring(0, 12) == "farSelected_") {
      console.log("selected Farbe: " + event.data.substring(12, 13));
      HauptFar = event.data.substring(12, 13);
      document.getElementById("Hauptschlagt").innerHTML += '<img width="20%" height="20%" alt="' + HauptFar + "_" + HauptSla + '" src="/deck/own/' + HauptFar + "_" + HauptSla + '.png" style="position:fixed;margin-left: 80%;">';
      document.getElementById("info").style.display = "none";
    }
    if (event.data.substring(0, 12) == "slaSelected_") {
      console.log("selected Schlag: " + event.data.substring(12, 14));
      HauptSla = event.data.substring(12, 14);
    }
    if (event.data.substring(0, 6) == "Stiche") {
      document.getElementById("SticheOL").textContent = event.data.substring(6, 999).split("#")[0] + " Stich(e)"
      document.getElementById("SticheOR").textContent = event.data.substring(6, 999).split("#")[1] + " Stich(e)"
      document.getElementById("SticheUR").textContent = event.data.substring(6, 999).split("#")[2] + " Stich(e)"
      document.getElementById("SticheUL").textContent = event.data.substring(6, 999).split("#")[3] + " Stich(e)"
    }
    if (event.data == "NewGame") {
      if (window.confirm("Nocheinmal?")) {
        wsSend("Yes")
      } else {
        wsSend("No")
      }
      ;
    }
    if (event.data == "off") {
      window.alert("Watten Spiel Beendet!");
    }
    if (event.data == "reset") {
      console.warn("RESET")
      type = "none";
      HauptFar = undefined;
      HauptSla = undefined;
      type = "none"
    }

  };

});

function init(pos) {
  clearInterval(startUpdateLoop);
  posYou = pos;
  document.getElementById("Stiche" + pos).style.backgroundColor = "crimson";
  wsSend(pos);
  document.getElementById("position").style.display = "none";
  document.getElementById("waiting").style.display = "block";
}
//send update until selected
startUpdateLoop = setInterval(function () {
  if (posYou == "None") {
    wsSend("None")
  }
}, 250);


function cardSelect(cardId) {
  document.getElementById("info").style.background = "unset"
  console.log(cardId);
  if (type == "selSla") {
    wsSend(cardId)
    type = ""
  }
  if (type == "selFar") {
    wsSend(cardId)
    type = ""
  }
  if (type == "YourSel") {
    document.getElementById(cardId).remove();
    document.getElementById("Msg").style.display = "none";
    wsSend(cardId)
    type = ""
  }
}