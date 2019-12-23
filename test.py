from PIL import Image 

img = Image.open("./images/process.png")

trans = img.transpose(Image.ROTATE_270)

trans.show()
