import io
import os
import pyqrcode
from base64 import b64encode
from PIL import Image

def generate_qr(data, display=False, save_path=None):
    """
    Generate a QR code from input data with options to display and save
    Args:
        data (str or convertible to str): Content to encode in the QR code
        display (bool, optional): Whether to display the QR code. Defaults to False.
        save_path (str, optional): Path where to save the QR code image. If relative,
                                   will be converted to absolute path. Defaults to None.
    Returns:
        str: Base64 encoded data URI string of the QR code image
    Raises:
        ValueError: If data is None, empty, or not convertible to string
    """
    

    if data is None:
        raise ValueError("Error: QR code data cannot be None")
    
    if not isinstance(data, str):
        try:
            data = str(data)
        except:
            raise ValueError("Error: QR code data must be convertible to string")
    
    if data == "":
        raise ValueError("Error: QR code data cannot be empty")
    
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

