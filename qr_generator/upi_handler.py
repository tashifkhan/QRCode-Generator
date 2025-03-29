from . import qr_handler as qr
import os

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
    qr.generate_qr(upi_data, display=True)

    if input("Do you want to save the QR code? (y/n): ").lower() == 'y':
        print("The path should contain the file name and extension.")
        print("Example: /path/to/qr_code.png")
        print("If no path is provided, the QR code will be saved in the Downloads folder.")
        print()
        save_path = input("Enter the path to save the QR code: ")
        if not save_path:
            home_dir = os.path.expanduser("~")
            downloads_folder = os.path.join(home_dir, "Downloads")

            filename = f"{upi_id.replace('@', '-')}_{amt}.png"
            save_path = os.path.join(downloads_folder, filename)

            if not os.path.exists(downloads_folder):
                os.makedirs(downloads_folder)
        qr.generate_qr(upi_data, display=False, save_path=save_path)
        print(f"QR code saved to: {save_path}")
    else:   
        print("QR code not saved.")
    