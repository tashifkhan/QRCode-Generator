from . import qr_handler as qr
import os
from rich.console import Console
from rich.prompt import Prompt
from rich.panel import Panel

console = Console()

def generate_upi_qr():
    console.print(Panel.fit("UPI QR Code Generator", border_style="blue"))
    
    upi_id = Prompt.ask("[cyan]Enter UPI ID[/cyan]", default="tashifkhan010-2@okaxis")
    display_name = Prompt.ask("[cyan]Enter display name[/cyan]", default="Tashif Ahmad Khan")
    amt = Prompt.ask("[cyan]Enter amount[/cyan]", default="0.00")

    if not amt:
        amt = "0.00"
    elif "." not in amt:
        amt = amt + ".00"

    upi_data = f"upi://pay?pa={upi_id}&pn={display_name}&am={amt}&cu=INR"
    
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
