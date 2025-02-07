from modules.qrcode_genreator import generate_qr as generate_qr_code
import eel

eel.init('web')

@eel.expose
def generate_qr_web(data):
    try:
        return generate_qr_code(data)
    except Exception as e:
        print(f"Error generating QR code: {str(e)}")
        return None

eel.start('index.html', size=(400, 800), port=8898)
