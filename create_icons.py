from PIL import Image, ImageDraw
import os

def create_icon(size, filename):
    # Create image with amber background
    img = Image.new('RGB', (size, size), '#d97706')
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    s = size / 512
    
    # Draw white castle
    # Main towers
    draw.rectangle([100*s, 200*s, 160*s, 380*s], fill='white')
    draw.rectangle([226*s, 150*s, 286*s, 380*s], fill='white')
    draw.rectangle([352*s, 200*s, 412*s, 380*s], fill='white')
    
    # Tower tops
    draw.rectangle([95*s, 160*s, 165*s, 210*s], fill='white')
    draw.rectangle([221*s, 110*s, 291*s, 160*s], fill='white')
    draw.rectangle([347*s, 160*s, 417*s, 210*s], fill='white')
    
    # Battlements (crenellations)
    draw.rectangle([95*s, 145*s, 115*s, 170*s], fill='white')
    draw.rectangle([135*s, 145*s, 155*s, 170*s], fill='white')
    draw.rectangle([221*s, 95*s, 241*s, 120*s], fill='white')
    draw.rectangle([261*s, 95*s, 281*s, 120*s], fill='white')
    draw.rectangle([347*s, 145*s, 367*s, 170*s], fill='white')
    draw.rectangle([387*s, 145*s, 407*s, 170*s], fill='white')
    
    # Door (amber on white)
    draw.rounded_rectangle([231*s, 300*s, 281*s, 380*s], radius=int(25*s), fill='#d97706')
    
    # Base
    draw.rectangle([80*s, 370*s, 432*s, 390*s], fill='white')
    
    # Save
    img.save(filename, 'PNG')
    print(f'Created {filename}')

# Create icons
create_icon(192, '/home/pvrolo/castle-solutions/public/icon-192.png')
create_icon(512, '/home/pvrolo/castle-solutions/public/icon-512.png')

print('Icons created!')
