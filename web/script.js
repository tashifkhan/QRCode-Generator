document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('qr-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrDisplay = document.getElementById('qr-display');
    const downloadBtn = document.getElementById('download-btn');

    generateBtn.addEventListener('click', generateQRCode);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateQRCode();
        }
    });

    async function generateQRCode() {
        const text = input.value.trim();
        if (!text) {
            alert('Please enter a URL or text');
            return;
        }

        try {
            const response = await fetch('/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: text })
            });

            if (!response.ok) throw new Error('Failed to generate QR code');

            const data = await response.json();
            const img = document.createElement('img');
            img.src = data.qr_code;
            img.alt = 'Generated QR Code';

            qrDisplay.innerHTML = '';
            qrDisplay.appendChild(img);
            downloadBtn.classList.remove('hidden');

            // Setup download button
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.download = 'qr-code.png';
                link.href = data.qr_code;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate QR code. Please try again.');
        }
    }
});