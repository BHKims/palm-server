import cv2
#from line import Line
import numpy as np
from PIL import Image, ImageDraw 
import math
import sys 

# Parameters : cv2.HoughLinesP
rho = 2
theta = np.pi/180
threshold = 50
min_line_length = 40
max_line_gap = 20

# Parameters : CannyThreshold
ratio = 3
kernel_size = 3

# Extract Main Three Palm lines...============================================
def CannyThreshold(val):
    low_threshold = val
    img_blur = cv2.blur(src_gray, (3,3))
    detected_edges = cv2.Canny(img_blur, low_threshold, low_threshold*ratio, kernel_size)
    mask = detected_edges != 0
    dst = src * (mask[:,:,None].astype(src.dtype))
    cv2.imwrite('images/1.rectTest.png', dst)

# Image Resize ================================================================
#imagePath = 'images/hand_kim.jpg'
imagePath = sys.argv[1]
print(imagePath)
image = Image.open(imagePath)
W, H = image.size
if W != 533 and H != 400 and W > H:
    image = image.transpose(Image.ROTATE_270)

resized_image = image.resize( (533, 400) )
resized_image.save(imagePath, 'png', quality=95)

# Canny ======================================================================
src = cv2.imread(imagePath)
if src is None:
    print('Could not open or find the image: ', args.input)
    exit(0)
src_gray = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
CannyThreshold(22)

# Crop Image to Rectangle..===================================================
dst = Image.open('images/1.rectTest.png')

width, height = dst.size 
left = 3*width/10
top = 45*height/100
right = 4*width/5
bottom = 3*height/4

cropped = dst.crop( (left, top, right, bottom) )
cropped.save('images/2.rect.png')

# cv2.HoughLinesP =============================================================
img = cv2.imread('images/2.rect.png', 1)
cannied = cv2.Canny(img, 30, 200, 3)

lines = cv2.HoughLinesP(cannied, rho, theta, threshold, 
    np.array([]), min_line_length, max_line_gap)

#print(lines)
# Draw Line on Image =========================================================
# Get 3 Line Coord + Texting onto Image....
im = Image.open('images/2.rect.png')
draw = ImageDraw.Draw(im)

point_list = [(0, 0, 0, 0), (0, 0, 0, 0), (0, 0, 0, 0)]
coord_list = [(0, 0), (0, 0), (0, 0)] # lefty & righty
tilt_list = [50, 0.0, 0.0]

for i in range(len(lines)):
    for leftx, lefty, rightx, righty in lines[i]:
        dy = righty - lefty
        dx = rightx - leftx 
        tilt = abs(dy/dx)
        #print('tilt: %.2f' %(tilt) )
        length = math.sqrt(dy*dy + dx*dx)

        if tilt > 0.1 and tilt < 0.2:
            sumval = point_list[0][0] + point_list[0][1] + point_list[0][2] + point_list[0][3]
            if(sumval == 0) :
                print('tilt0: %.2f, (%d %d %d %d)' %(tilt, leftx, lefty, rightx, righty))
                point_list[0] = (leftx, lefty, rightx, righty)
                tilt_list[0] = tilt 
                coord_list[0] = (lefty, righty)
            elif leftx > 50:
                if tilt > tilt_list[0]:
                #if leftx > point_list[0][0]:
                    print('tilt0: %.2f, (%d %d %d %d)' %(tilt, leftx, lefty, rightx, righty))
                    point_list[0] = (leftx, lefty, rightx, righty)
                    tilt_list[0] = tilt 
                    coord_list[0] = (lefty, righty)

        draw.line([leftx, lefty, rightx, righty], fill=(0, 0, 255), 
        width=2)

        draw.text(((leftx+rightx)/2, (lefty+righty)/2), "%.2f" %(tilt), 
        fill=(255,255,0))

for i in range(len(lines)):
    for leftx, lefty, rightx, righty in lines[i]:
        
        dy = righty - lefty
        dx = rightx - leftx 
        tilt = abs(dy/dx)
        #print('tilt: %.2f' %(tilt) )

        if tilt > 0.75 and tilt < 1.3:
            width, height = im.size 
            if rightx < width/2:
                sumval = point_list[2][0] + point_list[2][1] + point_list[2][2] + point_list[2][3]
                if(sumval == 0) :
                    print('tilt2: %.2f, (%d %d %d %d)' %(tilt, leftx, lefty, rightx, righty))
                    point_list[2] = (leftx, lefty, rightx, righty)
                    coord_list[2] = (lefty, righty)
                    tilt_list[2] = tilt  
                elif tilt > tilt_list[2]:
                    #print('tilt2: %.2f' %(tilt))
                    print('tilt2: %.2f, (%d %d %d %d)' %(tilt, leftx, lefty, rightx, righty))
                    point_list[2] = (leftx, lefty, rightx, righty)
                    coord_list[2] = (lefty, righty)
                    tilt_list[2] = tilt  

        draw.line([leftx, lefty, rightx, righty], fill=(0, 0, 255), 
        width=2)

        draw.text(((leftx+rightx)/2, (lefty+righty)/2), "%.2f" %(tilt), 
        fill=(255,255,0))

for i in range(len(lines)):
    for leftx, lefty, rightx, righty in lines[i]:
        dy = righty - lefty
        dx = rightx - leftx 
        tilt = abs(dy/dx)
        #print('tilt: %.2f' %(tilt) )

        if tilt > 0.25 and tilt < 0.5:
            sumval = point_list[1][0] + point_list[1][1] + point_list[1][2] + point_list[1][3]
            if(sumval == 0) :
                print('tilt1: %.2f, (%d %d %d %d)' %(tilt, leftx, lefty, rightx, righty))
                point_list[1] = (leftx, lefty, rightx, righty)
                coord_list[1] = (lefty, righty)
                tilt_list[1] = tilt
            else:
                if rightx > point_list[2][2] :
                    if tilt > tilt_list[1]:
                        if lefty > point_list[1][1] and righty > point_list[1][3]:
                            print('tilt1: %.2f, (%d %d %d %d)' %(tilt, leftx, lefty, rightx, righty))
                            point_list[1] = (leftx, lefty, rightx, righty)
                            coord_list[1] = (lefty, righty)
                            tilt_list[1] = tilt  

im.save("images/3.drawn.png")
print(point_list)
im2 = Image.open(imagePath)
draw2 = ImageDraw.Draw(im2)

#label_list = ['감정선', '지능선', '건강선']
label_list = ['emotion', 'intellect', 'health']

cnt = 0
for leftx, lefty, rightx, righty in point_list:
    nLeftx = left + leftx 
    nLefty = top + lefty 
    nRightx = left + rightx 
    nRighty = top + righty 

    print('prev: ', leftx, lefty, rightx, righty)
    print('coord: ', nLeftx, nLefty, nRightx, nRighty)

    draw2.line([nLeftx, nLefty, nRightx, nRighty], fill=(0, 0, 255), 
    width=2)

    draw2.text(((nLeftx+nRightx)/2, (nLefty+nRighty)/2), "%s" %(label_list[cnt]), 
    fill=(255,255,0))
    cnt = cnt+1
#cv2.imwrite('images/4.result.png',cannied)

im2.save("images/result.png")
cv2.waitKey(0)
cv2.destroyAllWindows()