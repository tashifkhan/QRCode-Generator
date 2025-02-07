function generateQRCode() {
    let data = document.getElementById("data").value;
    if (!data) {
        alert("Please enter text or URL");
        return;
    }
    eel.generate_qr_web(data)(function(base64) {
        console.log(base64);
        if (base64) {
            setImage(base64);
        } else {
            alert("Failed to generate QR code");
        }
    });
}

function setImage(base64) {
    let data = document.getElementById("data").value;
    const qrImage = document.getElementById("qr");
    const downloadBtn = document.getElementById("download-btn");
    const qrSection = document.querySelector(".qr-section");
    
    qrImage.src = base64;
    qrImage.style.display = "block";
    qrImage.style.margin = "0 auto"; // Center the image horizontally
    downloadBtn.style.display = "block";
    qrSection.style.display = "flex"; // Changed to flex for better centering
    qrSection.style.flexDirection = "column";
    qrSection.style.alignItems = "center";
    qrSection.style.justifyContent = "center"; // Center vertically within section
    
    downloadBtn.onclick = function() {
        const link = document.createElement("a");
        link.href = base64;
        link.download = `qr-${data}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

window.onload = function() {
    document.getElementById("qr").style.display = "none";
    document.getElementById("download-btn").style.display = "none";
    document.querySelector(".qr-section").style.display = "none";
};
