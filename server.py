import asyncio
from asyncio.tasks import sleep
import random
from typing_extensions import ParamSpec
import websockets
import threading
import subprocess


class CardDeck:
    def __init__(self) -> None:
        # gnerate cards
        #Eichel, Grass, Herz, Schellen
        Farben = ["E", "G", "H", "S"]
        Zahlen = ["7", "8", "9", "10", "U", "O", "K", "A"]
        self.Deck = []
        for F in Farben:
            for Z in Zahlen:
                self.Deck += [f"{F}_{Z}"]
        DeckSave = self.Deck
        self.Deck = random.sample(self.Deck, len(self.Deck))

        # austeilen
        self.players = {0: [], 1: [], 2: [], 3: []}
        for i in range(4):
            for x in range(3):
                self.players[i] += [self.Deck[-1]]
                self.Deck.pop(-1)
        for i in range(4):
            for x in range(2):
                self.players[i] += [self.Deck[-1]]
                self.Deck.pop(-1)
        i = 0
        for _ in self.players:
            self.players[i] = sorted(self.players[i])
            i += 1

        print(self.players)
        for x in self.Deck:
            DeckSave.remove(x)
        self.Deck = DeckSave[:]
        print(self.Deck)


def getPlayerId(name):
    i = 0
    for x in line:
        if x == name:
            return i
        i += 1


def getPoints(HsFar, HsSla):
    F = ["E", "G", "H", "S"]
    Z = ["A", "K", "O", "U", "10", "9", "8", "7"]

    goodBad = ["H_K", "S_7", "E_7", f"{HsFar}_{HsSla}"]
    for x in F:
        if f"{x}_{HsSla}" not in goodBad:
            goodBad += [f"{x}_{HsSla}"]
    for x in Z:
        if f"{HsFar}_{x}" not in goodBad:
            goodBad += [f"{HsFar}_{x}"]
    for x in F:
        for y in Z:
            if f"{x}_{y}" not in goodBad:
                goodBad += [f"{x}_{y}"]

    goodBad.reverse()
    return goodBad


def evaluateWinner(Stapel, HsFar, HsSla):
    # generate best to worst card
    goodBad = getPoints(HsFar, HsSla)
    Stuff = {}
    for key, value in Stapel.items():
        Stuff[goodBad.index(key)] = [key, value]
    print(Stuff)
    m = 0
    best = []
    for key, value in Stuff.items():
        if key > m:
            best = value
            m = key
    return best

# Test
# evaluateWinner({"G_A":1,"E_7":2,"G_7":3,"H_K":0},"G","A")


Card = CardDeck()

line = ["OL", "OR", "UR", "UL"]
usedPos = [False, False, False, False]
activePlayer = 1
players = 0
Stiche = [0, 0, 0, 0]
waiting = -1
playerRound = 0
stapel = {}
best = -1

Playing = True

Sla = ""
Far = ""
w1 = True
w2 = True
running = False

gehen=-1
gehenAnswerC=0
gehenAnswer=False


def a1(var):
    if var < 3:
        return var+1
    else:
        return 0


async def server(websocket, path):
    pos = -1
    global players
    global waiting
    global stapel
    global activePlayer
    global playerRound
    global w1
    global w2
    global Sla
    global Far
    global usedPos
    global running
    global Playing
    global Card
    global Stiche
    global best
    global gehen
    global gehenAnswerC
    global gehenAnswer


    NewPlay = False
    try:
        while Playing:
            # send free spaces
            if not NewPlay:
                i = 0
                ok = []
                for x in usedPos:
                    if x == False:
                        ok += [line[i]]
                    i += 1
                await websocket.send(f"FR_{'#'.join(ok)}")

                # wait for position selection
                testing = True
                while testing:
                    rec = await websocket.recv()
                    if (rec != "None"):
                        pos = getPlayerId(rec)
                        usedPos[pos] = True
                        testing = False
                    else:
                        # resend free spaces
                        i = 0
                        ok = []
                        for x in usedPos:
                            if x == False:
                                ok += [line[i]]
                            i += 1
                        await websocket.send(f"FR_{'#'.join(ok)}")

            if pos == 0:
                parterPlayer = 2
            if pos == 1:
                parterPlayer = 3
            if pos == 2:
                parterPlayer = 0
            if pos == 3:
                parterPlayer = 1

            print(Card.players[pos])

            await websocket.send("IT:"+"#".join(Card.players[pos]))

            # waiting for players to join
            players += 1
            while players < 4:
                await websocket.send(f"PL{players}")
                await asyncio.sleep(1)

            await websocket.send("clear")

            if not running:
                ##############################
                # selecting Schlag
                if pos == a1(playerRound):
                    # Schlag
                    await websocket.send("SelSla")
                    Sla = await websocket.recv()
                    Sla = Sla[2:]
                    print("Schlag: "+Sla)
                    w1 = False

                # wait for Schlag select
                else:
                    while w1:
                        await websocket.send("waitSla")
                        await asyncio.sleep(0.5)
                await websocket.send(f"slaSelected_{Sla}")

                # selecting Farbe
                if pos == playerRound:
                    # Farbe
                    await websocket.send("SelFar")
                    Far = await websocket.recv()
                    Far = Far[0]
                    w2 = False

                    a = getPoints(Far, Sla)
                    b = []
                    for x in a:
                        b += [x.replace("E", "Eichel").replace("S",
                                                               "Schellen").replace("H", "Herz").replace("G", "Gra??")]
                    print(b)

                # wait for Farbe select
                else:
                    while w2:
                        await websocket.send("waitFar")
                        await asyncio.sleep(0.5)
            else:
                i = []
                for x in Stiche:
                    i += [str(x)]
                await websocket.send(f"Stiche{'#'.join(i)}")
            await websocket.send(f"slaSelected_{Sla}")
            await websocket.send(f"farSelected_{Far}")
            ##################################

            running = True
            print(f"{pos}: ok")
            await websocket.send(f"Stapel{'#'.join(stapel)}")

            # mainLoop
            while len(Card.Deck) > 0:
                if activePlayer == pos:
                    waiting = pos
                    await websocket.send("YourSel")
                    while True:
                        try:
                            data = await asyncio.wait_for(websocket.recv(),1)
                        except asyncio.TimeoutError:
                            pass
                        else:
                            if data=="AskIfwanaGo":
                                gehenAnswer=True
                                gehen=pos
                                while gehenAnswerC<2:
                                    await websocket.send(f"waitingGehenAnswer_{gehenAnswerC}")
                                    await asyncio.sleep(0.5)
                                if gehenAnswer==True:
                                    await websocket.send("TheyGo")
                                    break
                                else:
                                    await websocket.send("TheyNoGo")
                                    await asyncio.sleep(1)
                                    gehen=-1
                                    gehenAnswerC=0
                                    gehenAnswer=False
                            else:
                                break
                        
                        #test for "gehen"
                        if gehen!=-1 and gehen!=pos and gehen!=parterPlayer:
                            await websocket.send("wanaGo")
                            a=await websocket.recv()
                            gehenAnswerC+=1
                            if a=="False": gehenAnswer=False
                            while gehenAnswerC<2:
                                await websocket.send(f"waitingGehenAnswer_{gehenAnswerC}")
                                await asyncio.sleep(0.5)
                            
                            if gehenAnswer:
                                await websocket.send("weGo")
                                break
                            else:
                                await websocket.send("weNoGo")
                                await asyncio.sleep(2)
                            gehenAnswerC=0
                        elif gehen!=-1:
                            while gehenAnswerC<2:
                                await websocket.send(f"waitingGehenAnswer_{gehenAnswerC}")
                                await asyncio.sleep(0.5)
                            if gehenAnswer==True:
                                await websocket.send("TheyGo")
                                break
                            else:
                                await websocket.send("TheyNoGo")
                                await asyncio.sleep(2)
                    if gehenAnswer==True:
                        break
                    Card.players[pos].remove(data)
                    Card.Deck.remove(data)

                    stapel[data] = pos
                    activePlayer = a1(activePlayer)
                    waiting = -1
                    if len(stapel) >= 4:
                        await asyncio.sleep(0.1)
                        await websocket.send(f"Stapel{'#'.join(stapel)}")
                        best = evaluateWinner(stapel, Far, Sla)
                        Stiche[best[1]] += 1
                        i = []
                        for x in Stiche:
                            i += [str(x)]
                        activePlayer = best[1]
                        await asyncio.sleep(2.9)
                        # send message
                        if best[1] == pos:
                            await websocket.send(f"GotStiDu")
                        elif best[1] == parterPlayer:
                            await websocket.send(f"GotStiPartner")
                        else:
                            await websocket.send(f"GotStiGegner")
                        await asyncio.sleep(1.9)
                        best = -1
                        await websocket.send(f"Stiche{'#'.join(i)}")
                        stapel = {}
                        await websocket.send(f"Stapel{'#'.join(stapel)}")
                        if Stiche[0]+Stiche[2] >= 3:
                            print("won")
                        if Stiche[1]+Stiche[3] >= 3:
                            print("won")

                else:
                    while waiting != -1:
                        await websocket.send(f"WaiOnP{waiting}")
                        try:
                            data = await asyncio.wait_for(websocket.recv(),0.25)
                        except asyncio.TimeoutError:
                            pass
                        else:
                            if data=="AskIfwanaGo":
                                gehenAnswer=True
                                gehen=pos
                                while gehenAnswerC<2:
                                    await websocket.send(f"waitingGehenAnswer_{gehenAnswerC}")
                                    await asyncio.sleep(0.5)
                                if gehenAnswer==True:
                                    await websocket.send("TheyGo")
                                    break
                                else:
                                    await websocket.send("TheyNoGo")
                                    await asyncio.sleep(1)
                                    gehen=-1
                                    gehenAnswerC=0
                                    gehenAnswer=False

                        #test for "gehen"
                        if gehen!=-1 and gehen!=pos and gehen!=parterPlayer:
                            await websocket.send("wanaGo")
                            a=await websocket.recv()
                            gehenAnswerC+=1
                            if a=="False": gehenAnswer=False
                            while gehenAnswerC<2:
                                await websocket.send(f"waitingGehenAnswer_{gehenAnswerC}")
                                await asyncio.sleep(0.5)
                            
                            if gehenAnswer:
                                await websocket.send("weGo")
                                break
                            else:
                                await websocket.send("weNoGo")
                                await asyncio.sleep(2)
                            gehenAnswerC=0
                        elif gehen!=-1:
                            while gehenAnswerC<2:
                                await websocket.send(f"waitingGehenAnswer_{gehenAnswerC}")
                                await asyncio.sleep(0.5)
                            if gehenAnswer==True:
                                await websocket.send("TheyGo")
                                break
                            else:
                                await websocket.send("TheyNoGo")
                                await asyncio.sleep(2)
                    if gehenAnswer==True:
                        break

                    await websocket.send(f"Stapel{'#'.join(stapel)}")

                    if len(stapel) >= 4:
                        await asyncio.sleep(3)
                        # send message
                        if best[1] == pos:
                            await websocket.send(f"GotStiDu")
                        elif best[1] == parterPlayer:
                            await websocket.send(f"GotStiPartner")
                        else:
                            await websocket.send(f"GotStiGegner")

                        await asyncio.sleep(2)
                        i = []
                        for x in Stiche:
                            i += [str(x)]
                        await websocket.send(f"Stiche{'#'.join(i)}")
                        await websocket.send(f"Stapel{'#'.join(stapel)}")
                await asyncio.sleep(0.1)
            
            if gehenAnswer==True:
                print("exited Because Gehen")
                await asyncio.sleep(2)
                gehen=-1
                gehenAnswerC=0
                gehenAnswer=False
                stapel={}

            if activePlayer == pos:
                Playing = None
                await websocket.send("NewGame")
                rec = await websocket.recv()
                if rec == "Yes":
                    Playing = True
                else:
                    Playing = False
                Card = CardDeck()
                playerRound += 1
                activePlayer = playerRound+1
                w1 = True
                w2 = True
                Stiche = [0, 0, 0, 0]
            else:
                await asyncio.sleep(2)
                while Playing == None:
                    await asyncio.sleep(0.5)
                if Playing == False:
                    await websocket.send("off")
            await websocket.send("reset")
            i = []
            for x in Stiche:
                i += [str(x)]
            await websocket.send(f"Stiche{'#'.join(i)}")
            NewPlay = True
            running = False
    except websockets.ConnectionClosed as e:
        if pos != -1:
            players -= 1
            usedPos[pos] = False
            print(f"{pos} disconnected! {players} remaining.")
        else:
            print(f"Player disconnected! {players} remaining.")
        if players < 0:
            print("ERROR: Player below 0")
            players = 0
        return


start_server = websockets.serve(server, '', 8000)


def FileServer():
    subprocess.run("python3 -m http.server 80", capture_output=True)


threading.Thread(target=FileServer, daemon=True).start()

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
