from qr_generator import generate_qr, generate_upi_qr
import eel

eel.init('web')

@eel.expose
def generate_qr_web(data):
    try:
        return generate_qr(data)
    except Exception as e:
        print(f"Error generating QR code: {str(e)}")
        return None

@eel.expose
def generate_upi_qr_web(upi_id, display_name, amount):
    try:
        return generate_upi_qr(upi_id, display_name, amount)
    except Exception as e:
        print(f"Error generating UPI QR code: {str(e)}")
        return None

eel.start('index.html', size=(400, 800), port=8898)
