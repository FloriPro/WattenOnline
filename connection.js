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
  document.cookie = "serverIpAdress=" + location.host + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
}

var type = "none";
var ws;
var HauptFar;
var HauptSla;
var posYou = "None";
var gehen = false;

var wsOpen = false

function wsSend(message) {
  if (wsOpen) {
    ws.send(message);
  }
}

function load() {

  document.getElementById("ConnectionInfo").style.color = "rgb(255, 0, 0)"
  ws = new WebSocket("ws://" + getCookie("serverIpAdress") + ":8000/");


  var cards = [];
  ws.onclose = function (event) {
    wsOpen = false;
    document.getElementById("ConnectionInfo").style.display="";
    document.getElementById("ConnectionInfo").innerText = "Verbindung geschlossen! Neu Versuch initialisiert";
    if (document.getElementById("HauptSchlagImg") != null) {
      document.getElementById("HauptSchlagImg").remove();
    }
    document.getElementById("Msg").style.display = "none"
    load();
  }

  ws.onopen = function (event) {
    console.log("ok");
    document.getElementById("position").style.display = "inline-table";
    document.getElementById("startingConnection").style.display = "none";
    document.getElementById("NeueIP").style.display = "none";
    wsOpen = true;
    document.getElementById("ConnectionInfo").style.color = "rgb(255, 0, 0)"
    document.getElementById("ConnectionInfo").style.display="none";
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
      document.title = "Watten Online | Warten auf genug Spieler";
      p = event.data.substring(2, 0);

      document.getElementById("waitingPlayer").innerHTML = "Vorhandene Spieler: " + event.data.substring(2, 3)
    }
    if (event.data.substring(0, 7) == "YourSel") {
      document.title = "Watten Online | Karte legen";
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
      document.title = "Watten Online | Position auswählen";

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
      document.title = "Watten Online | auf Spieler warten"
    }
    if (event.data.substring(0, 5) == "clear") {
      document.getElementById("waiting").style.display = "none";
      document.getElementById("game").style.display = "block";
    }
    if (event.data.substring(0, 7) == "waitSla") {
      document.getElementById("info").style.display = "unset";
      document.getElementById("info").textContent = "Warte auf die Auswahl vom Schlag";
      document.title = "Watten Online | Warte auf Schlag";
    }
    if (event.data.substring(0, 7) == "SelSla") {
      document.title = "Watten Online | Schlag auswählen";
      type = "selSla"
      document.getElementById("info").style.display = "unset";
      document.getElementById("info").style.background = "#0dff00"
      document.getElementById("info").textContent = "Bitte Schlag auswählen";
    }
    if (event.data.substring(0, 7) == "waitFar") {
      document.getElementById("info").style.display = "unset";
      document.getElementById("info").textContent = "Warte auf die Auswahl von Farbe | Schlag: " + HauptSla;
      document.title = "Watten Online | Warte auf Farbe";
    }
    if (event.data.substring(0, 7) == "SelFar") {
      document.title = "Watten Online | Farbe auswählen";
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
      document.getElementById("Hauptschlagt").innerHTML += '<img id="HauptSchlagImg" width="20%" alt="' + HauptFar + "_" + HauptSla + '" src="/deck/own/' + HauptFar + "_" + HauptSla + '.png">';
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
    if (event.data.substring(0, 6) == "GotSti") {
      var g = event.data.substring(6, 999);
      if (g == "Partner") {
        document.title = "Watten Online | Dein Partner hat gestochen";
        addMessage("Dein Partner hat gestochen!")
      }
      if (g == "Du") {
        document.title = "Watten Online | Du hast gestochen";
        addMessage("Du hast gestochen!")
      }
      if (g == "Gegner") {
        document.title = "Watten Online | Deine Gegner haben diesen Stich bekommen";
        addMessage("Deine Gegner haben diesen Stich bekommen.")
      }
    }
    if (event.data == "NewGame") {
      document.title = "Watten Online | Neues Spiel?";
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
      document.title = "Watten Online | Neues Spiel";
      console.warn("RESET")

      gehen = false;
      document.getElementById("yourCards").style.filter = "";
      document.getElementById("layedCards").style.filter = "";
      document.getElementById("Hauptschlagt").style.filter = "";
      document.getElementById("Msg").style.filter = "";
      document.getElementById("go_noGo").style.display = "none";
      document.getElementById("go_noGo_selection").style.display = "none";

      type = "none";
      document.querySelector("#HauptSchlagImg").remove()
      document.getElementById("Msg").style.display = "none"
      document.getElementById("layedCards").innerHTML = ""
      HauptFar = undefined;
      HauptSla = undefined;
      type = "none"
    }

    //gehen
    if (event.data.substring(0, 19) == "waitingGehenAnswer_") {
      if (gehen == false) {
        document.getElementById("yourCards").style.filter = "grayscale(1)";
        document.getElementById("layedCards").style.filter = "grayscale(1)";
        document.getElementById("Hauptschlagt").style.filter = "grayscale(1)";
        document.getElementById("Msg").style.filter = "grayscale(1)";
        document.getElementById("go_noGo").style.display = "";
      }

      gehen = true;
      document.getElementById("go_noGo_text").innerText = "Abstimmung findet stadt.\n Zurzeit haben " + event.data.substring(19, 999) + " Spieler abgestimmt.";
    }
    if (event.data == "wanaGo") {
      document.getElementById("go_noGo_selection").style.display="";
      document.getElementById("yourCards").style.filter = "grayscale(1)";
      document.getElementById("layedCards").style.filter = "grayscale(1)";
      document.getElementById("Hauptschlagt").style.filter = "grayscale(1)";
      document.getElementById("Msg").style.filter = "grayscale(1)";
      gehen = true;
      document.getElementById("go_noGo").style.display = "";
    }
    if (event.data == "TheyGo") {
      addMessage("Die Gegner sind gegangen");
    }
    if (event.data == "weGo") {
      addMessage("Ihr seid gegangen");
    }
    if (event.data == "weNoGo") {
      addMessage("Ihr seid nicht gegangen");
    }
    if (event.data == "TheyNoGo") {
      addMessage("Die Gegner sind nicht gegangen");
    }
    if (event.data == "TheyNoGo" || event.data == "weNoGo" || event.data == "weGo" || event.data == "TheyGo") {
      console.log("ex")
      gehen = false;
      document.getElementById("yourCards").style.filter = "";
      document.getElementById("layedCards").style.filter = "";
      document.getElementById("Hauptschlagt").style.filter = "";
      document.getElementById("Msg").style.filter = "";
      document.getElementById("go_noGo").style.display = "none";
    }

  };

}

window.addEventListener('load', load);

function init(pos) {
  document.title = "Watten Online"
  clearInterval(startUpdateLoop);
  posYou = pos;
  document.getElementById("Stiche" + pos).style.backgroundColor = "crimson";
  wsSend(pos);
  document.getElementById("position").style.display = "none";
  document.getElementById("game").style.display = "block";
}
//send update until selected
startUpdateLoop = setInterval(function () {
  if (posYou == "None") {
    wsSend("None")
  }
}, 250);


function cardSelect(cardId) {
  if (!gehen) {
    document.title = "Watten Online"
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
}

function weGo() {
  document.getElementById("go_noGo_selection").style.display="none";
  wsSend("True");
}
function weNoGo() {
  document.getElementById("go_noGo_selection").style.display="none";
  wsSend("False");
}
function youGo() {
  wsSend("AskIfwanaGo");
}