import asyncio
import random
import websockets

class Card:
    def __init__(self) -> None:
        #gnerate cards
        #Eichel, Grass, Herz, Schellen
        Farben=["E","G","H","S"]
        Zahlen=["7","8","9","10","U","O","K","A"]
        Deck=[]
        for F in Farben:
            for Z in Zahlen:
                Deck+=[f"{F}_{Z}"]
        random.shuffle(Deck)

        #austeilen
        self.players={0:[],1:[],2:[],3:[]}
        for i in range(4):
            for x in range(3):
                self.players[i]+=[Deck[-1]]
                Deck.pop(-1)
        for i in range(4):
            for x in range(2    ):
                self.players[i]+=[Deck[-1]]
                Deck.pop(-1)
        i=0
        for _ in self.players:
            self.players[i]=sorted(self.players[i])
            i+=1

        print(self.players)

def getPlayerId(name):
    i=0
    for x in line:
        if x ==name:
            return i
        i+=1

Card=Card()

line=["OL","OR","UR","UL"]
activePlayer=0
players=0
Stiche=[0,0,0,0]
waiting=-1
stapel=[]

async def time(websocket, path):
    global players
    global waiting
    global stapel
    pos = getPlayerId(await websocket.recv())
    print(Card.players[pos])

    await websocket.send("IT:"+"#".join(Card.players[pos]))

    players+=1
    while players<4:
        await websocket.send(f"PL{players}")
        await asyncio.sleep(1)
    print(f"{pos}: ok")
    while True:
        if activePlayer==pos:
            print(f"its {pos}")
            waiting=pos
            await websocket.send("Sel")
            data = await websocket.recv()
            stapel+=[data]
        else:
            while waiting!=-1:
                await websocket.send(f"WaiOnP{waiting}")
                await asyncio.sleep(0.25)
            await websocket.send(f"S_{'#'.join(stapel)}")
        await asyncio.sleep(0.1)



start_server = websockets.serve(time, '', 8000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
