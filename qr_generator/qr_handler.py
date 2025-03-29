import io
import os
import pyqrcode
from base64 import b64encode
from PIL import Image

def generate_qr(data, display=False, save_path=None):
    img = pyqrcode.create(data)
    buffers = io.BytesIO()

    img.png(buffers, scale=8)
    
    if display:
        buffers.seek(0)
        image = Image.open(buffers)
        image.show()
    
    if save_path is not None:
        if not os.path.isabs(save_path):
            save_path = os.path.abspath(save_path)
        
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        buffers.seek(0)
        image = Image.open(buffers)
        image.save(save_path)
        print(f"QR code saved to: {save_path}")
    
    encoded = b64encode(buffers.getvalue()).decode("ascii")
    print("QR code generation successful.")
    return "data:image/png;base64, " + encoded

def generate_upi_qr():
    upi_id = input("Enter UPI ID: ")
    display_name = input("Enter display name: ")
    amt = input("Enter amount: ")

    if not amt:
        amt = "0.00"
    elif "." not in amt:
        amt = amt + ".00"

    if not upi_id:
        upi_id = "tashifkhan010-2@okaxis"
    if not display_name:
        display_name = "Tashif Ahmad Khan"
    upi_data = f"upi://pay?pa={upi_id}&pn={display_name}&am={amt}&cu=INR"
    return generate_qr(upi_data, display=True)
