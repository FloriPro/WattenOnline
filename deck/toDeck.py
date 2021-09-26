from PIL import Image

im = Image.open("deck/og.jpg")

F=["E","G","H","S"]
Z=["A","10","K","O","U","9","8","7"]
cardXSize=317
cardYSize=540

jumpX=48
jumpY=24

startX=54
startY=37

iX=0
for pX in range(startX,len(Z)*(cardXSize+jumpX),(cardXSize+jumpX)):
    iY=0
    for pY in range(startY,len(F)*(cardYSize+jumpY),(cardYSize+jumpY)):
        im2=im.crop((pX,pY,pX+cardXSize,pY+cardYSize))
        try:
            im2.save("deck/own/"+F[iY]+"_"+Z[iX]+".png")
        except:pass
        iY+=1
    iX+=1