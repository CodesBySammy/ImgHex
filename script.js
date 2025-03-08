function previewImages() {
    const files = document.getElementById('imageInput').files;
    const previewContainer = document.getElementById('previewContainer');
    const selectAllContainer = document.getElementById('selectAllContainer');
    previewContainer.innerHTML = '';

    if (files.length > 0) {
        selectAllContainer.classList.remove('hidden');
    } else {
        selectAllContainer.classList.add('hidden');
    }

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageWrapper = document.createElement('div');
            const imgElement = document.createElement('img');
            imgElement.src = event.target.result;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'imageCheckbox';

            imageWrapper.appendChild(imgElement);
            imageWrapper.appendChild(checkbox);
            previewContainer.appendChild(imageWrapper);
        };
        reader.readAsDataURL(file);
    });
}

function toggleSelectAllImages() {
    const checkboxes = document.querySelectorAll('.imageCheckbox');
    checkboxes.forEach(checkbox => checkbox.checked = document.getElementById('selectAllImages').checked);
}

async function convertToHex() {
    const checkboxes = document.querySelectorAll('.imageCheckbox:checked');
    const hexOutput = document.getElementById('hexOutput');
    hexOutput.innerHTML = '';

    if (checkboxes.length === 0) {
        alert('Please select at least one image.');
        return;
    }

    for (const checkbox of checkboxes) {
        const imgElement = checkbox.previousSibling;
        const hexContainer = document.createElement('textarea');
        hexContainer.readOnly = true;
        hexContainer.style.width = "100%";
        hexContainer.style.height = "100px";

        try {
            const response = await fetch(imgElement.src);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const hexString = [...new Uint8Array(arrayBuffer)]
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');

            hexContainer.textContent = hexString;
            hexOutput.appendChild(hexContainer);
        } catch (error) {
            console.error("Error converting image to hex:", error);
        }
    }
}


function addHexInput() {
    const hexInputs = document.getElementById('hexInputs');
    const textarea = document.createElement('textarea');
    textarea.className = 'hexInput';
    textarea.placeholder = "Paste hex code here...";
    hexInputs.appendChild(textarea);
}

function convertToImages() {
    const hexInputs = document.querySelectorAll('.hexInput');
    const outputDiv = document.getElementById('outputImages');
    const selectAllHexContainer = document.getElementById('selectAllHexContainer');
    outputDiv.innerHTML = '';

    if (hexInputs.length > 0) {
        selectAllHexContainer.classList.remove('hidden');
    } else {
        selectAllHexContainer.classList.add('hidden');
    }

    hexInputs.forEach(input => {
        const hexString = input.value.trim();
        if (hexString) {
            const binaryData = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            const blob = new Blob([binaryData], { type: 'image/png' });
            const imgURL = URL.createObjectURL(blob);

            const imgElement = document.createElement('img');
            imgElement.src = imgURL;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'imageCheckbox';
            checkbox.value = imgURL;

            const imageWrapper = document.createElement('div');
            imageWrapper.appendChild(imgElement);
            imageWrapper.appendChild(checkbox);
            outputDiv.appendChild(imageWrapper);
        }
    });
}

function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.imageCheckbox');
    checkboxes.forEach(checkbox => checkbox.checked = document.getElementById('selectAll').checked);
}

function downloadSelectedImages() {
    const checkboxes = document.querySelectorAll('.imageCheckbox:checked');
    if (checkboxes.length === 0) return;

    const zip = new JSZip();
    checkboxes.forEach((checkbox, index) => {
        fetch(checkbox.value)
            .then(res => res.blob())
            .then(blob => {
                zip.file(`image${index + 1}.png`, blob);
                if (index === checkboxes.length - 1) {
                    zip.generateAsync({ type: "blob" }).then(content => {
                        saveAs(content, "images.zip");
                    });
                }
            });
    });
}
