import io
import pyqrcode
from base64 import b64encode
from PIL import Image

def generate_qr(data, display=False):
    img = pyqrcode.create(data)
    buffers = io.BytesIO()
    img.png(buffers, scale=8)
    
    if display:
        buffers.seek(0)
        image = Image.open(buffers)
        image.show()
    
    encoded = b64encode(buffers.getvalue()).decode("ascii")
    print("QR code generation successful.")
    return "data:image/png;base64, " + encoded

if __name__ == "__main__":
    generate_qr("URL_ADDRESS.youtube.com/watch?v=dQw4w9WgXcQ", display=True)