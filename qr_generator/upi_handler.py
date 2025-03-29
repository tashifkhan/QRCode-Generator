from . import qr_handler as qr
import os
import re
import urllib.parse
from rich.console import Console
from rich.prompt import Prompt
from rich.panel import Panel

console = Console()

def generate_upi_qr():
    """
    Generate a QR code for UPI payment with interactive console prompts.
    This function prompts the user for UPI payment details (UPI ID, display name,
    and amount), generates a QR code for UPI payment, and provides options to
    display and save the QR code to a file. Handles various edge cases including
    path validation, directory creation, and error recovery.
    Returns:
        bytes: QR code image data as bytes if generated successfully, otherwise None.
              The return value is primarily for internal use or programmatic access
              to the generated QR code.
    Interactive Features:
        - Prompts for UPI ID, display name, and payment amount
        - Displays generated QR code on screen
        - Option to save QR code to file with smart path handling
        - Fallback mechanisms for error situations
    """

    console.print(Panel.fit("UPI QR Code Generator", border_style="blue"))
    
    upi_id = Prompt.ask("[cyan]Enter UPI ID[/cyan]", default="tashifkhan010@pingpay")
    display_name = Prompt.ask("[cyan]Enter display name[/cyan]", default="Tashif Ahmad Khan")
    amt = Prompt.ask("[cyan]Enter amount[/cyan]", default="0.00")

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
            
        if not amt:
            amt = "0.00"  
        else:
            try:
                # Convert to float for validation
                float_amount = float(amt)
                if float_amount < 0:
                    raise ValueError("Amount cannot be negative")
                
                # Format as string with 2 decimal places
                amt = f"{float_amount:.2f}"
            except (ValueError, TypeError):
                raise ValueError(f"Invalid amount: {amt}. Amount must be a valid number")
        
        # URL encode parameters to handle special characters
        upi_id_encoded = urllib.parse.quote(upi_id)
        display_name_encoded = urllib.parse.quote(display_name)
        
        upi_data = f"upi://pay?pa={upi_id_encoded}&pn={display_name_encoded}&am={amt}&cu=INR"
        
        console.print(f"\n[yellow]Creating QR code with the following details:[/yellow]")
        console.print(f"[green]• UPI ID:[/green] {upi_id}")
        console.print(f"[green]• Name:[/green] {display_name}")
        console.print(f"[green]• Amount:[/green] ₹{amt}")
        
        if not upi_data:
            console.print("[bold red]Error:[/bold red] Unable to generate UPI data string.")
            return
            
        try:
            with console.status("[bold green]Generating QR code...[/bold green]", spinner="dots"):
                qr.generate_qr(upi_data, display=True)
        except Exception as e:
            console.print(f"[bold red]Error generating QR code:[/bold red] {str(e)}")
            return
    
    except ValueError as e:
        console.print(f"[bold red]Validation Error:[/bold red] {str(e)}")
        return

    if Prompt.ask("[cyan]Do you want to save the QR code?[/cyan]", choices=["y", "n"], default="y") == 'y':
        console.print("[yellow]The path should contain the file name and extension.[/yellow]")
        console.print("[yellow]Example: ~/Downloads/qr_code.png or C:\\Users\\name\\Downloads\\qr_code.png[/yellow]")
        console.print("[yellow]If no path is provided, the QR code will be saved in the Downloads folder.[/yellow]")
        console.print()
        
        # Set default based on OS
        default_path = os.path.join("~", "Downloads", "qr_code.png")
        save_path = Prompt.ask("[cyan]Enter the path to save the QR code[/cyan]", default=default_path)
        
        if not save_path:
            home_dir = os.path.expanduser("~")
            downloads_folder = os.path.join(home_dir, "Downloads")
            filename = f"{upi_id.replace('@', '-')}_{amt}.png"
            save_path = os.path.join(downloads_folder, filename)
        else:
            # Expand user directory if path starts with ~
            save_path = os.path.expanduser(save_path)
            
            # If the path doesn't have a drive or doesn't start with a slash (relative path)
            # and doesn't start with ~, assume it's relative to current directory
            if not os.path.isabs(save_path) and not save_path.startswith('~'):
                save_path = os.path.join(os.getcwd(), save_path)
            
            # Ensure file has .png extension
            if not save_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                save_path += '.png'
                
            try:
                # Get the directory part of the provided path
                dir_path = os.path.dirname(os.path.abspath(save_path))
                # Create directory if it doesn't exist
                if not os.path.exists(dir_path) and dir_path:
                    os.makedirs(dir_path)
                save_path = os.path.abspath(save_path)
            except OSError as e:
                console.print(f"[bold red]Error with save path:[/bold red] {str(e)}")
                filename = os.path.basename(save_path)
                save_path = os.path.join(os.getcwd(), filename or f"upi_qr_{upi_id.replace('@', '-')}.png")
                console.print(f"[yellow]Falling back to: {save_path}[/yellow]")
                
        try:
            with console.status("[bold green]Saving QR code...[/bold green]", spinner="dots"):
                qr.generate_qr(upi_data, display=False, save_path=save_path)
            console.print(f"[bold green]✓[/bold green] QR code saved to: [blue]{save_path}[/blue]")
        except Exception as e:
            console.print(f"[bold red]Error saving QR code:[/bold red] {str(e)}")
            console.print("[yellow]Trying alternative location...[/yellow]")
            alt_path = os.path.join(os.getcwd(), f"upi_qr_{upi_id.replace('@', '-')}.png")
            try:
                qr.generate_qr(upi_data, display=False, save_path=alt_path)
                console.print(f"[bold green]✓[/bold green] QR code saved to: [blue]{alt_path}[/blue]")
            except Exception as e2:
                console.print(f"[bold red]Failed to save QR code:[/bold red] {str(e2)}")
    else:   
        console.print("[yellow]QR code not saved.[/yellow]")
    
    return qr.generate_qr(upi_data, display=False)
