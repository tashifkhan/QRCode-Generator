from .qr_handler import generate_qr
import re

def generate_upi_web(upi_id, display_name, amount):
    """
    Generate a UPI QR code for web use with input validation
    
    Args:
        upi_id (str): UPI ID (e.g. name@upi)
        display_name (str): Name to display on payment app
        amount (str or float): Amount to be paid
        
    Returns:
        bytes: QR code image data or None if error occurs
    """
    try:
        # Validate UPI ID
        if not upi_id or not isinstance(upi_id, str):
            raise ValueError("Invalid UPI ID: UPI ID must be a non-empty string")
        
        # Basic UPI ID format validation (username@provider)
        if not re.match(r'^[a-zA-Z0-9\.\-_]+@[a-zA-Z0-9]+$', upi_id):
            raise ValueError(f"Invalid UPI ID format: {upi_id}. Expected format: username@provider")
        
        # Validate display name
        if not display_name or not isinstance(display_name, str):
            raise ValueError("Invalid display name: Name must be a non-empty string")
            
        # Process amount
        if amount is None:
            amount = "0.00"  # Default amount
        else:
            try:
                # Convert to float for validation
                float_amount = float(amount)
                if float_amount < 0:
                    raise ValueError("Amount cannot be negative")
                
                # Format as string with 2 decimal places
                amount = f"{float_amount:.2f}"
            except (ValueError, TypeError):
                raise ValueError(f"Invalid amount: {amount}. Amount must be a valid number")
        
        # URL encode parameters to handle special characters
        import urllib.parse
        upi_id_encoded = urllib.parse.quote(upi_id)
        display_name_encoded = urllib.parse.quote(display_name)
        
        # Construct UPI URL
        upi_data = f"upi://pay?pa={upi_id_encoded}&pn={display_name_encoded}&am={amount}&cu=INR"
        
        # Generate QR code
        qr_code = generate_qr(upi_data)
        
        if not qr_code:
            raise RuntimeError("QR code generation failed")
            
        return qr_code
    
    except Exception as e:
        print(f"Error generating UPI QR code: {str(e)}")
        return None