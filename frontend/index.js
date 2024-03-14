function Req(requestData) {
    // Replace 'your_api_endpoint' with the actual API endpoint URL
    const apiUrl = 'http://localhost:8888/predict';
    console.log(JSON.stringify(requestData));
    fetch(apiUrl, {
        method: 'POST', // Change this to 'GET' if it's a GET request
        headers: {
            'Content-Type': 'application/json', // Adjust the content type based on your API requirements
            // Add any other headers as needed
        },
        body: JSON.stringify(requestData), // Convert the data to JSON format
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        handleResponse(data);
    }).catch(error => {
        console.error('Fetch error:', error);
    });
}

function ReqFile(requestData, callback) {
    const apiUrl = 'http://localhost:8888/predict_csv';
    const formData = new FormData();
    formData.append('file', requestData, requestData.name);

    // Show loading indicator
    document.getElementById('loadingOverlay').style.display = 'block';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            // No need to set 'Content-Type' for FormData, it will be set automatically
            // Add any other headers as needed
        },
        body: formData,
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    }).then(data => {
        // Handle the API response here
        console.log('API response:', data);
        if(data === null){
            alert("error response is null")
            return;
        }
        handleCSVData(data);

        // Hide loading indicator after response is received
        document.getElementById('loadingOverlay').style.display = 'none';

        if (callback) {
            callback();
        }
    }).catch(error => {
        console.error('Fetch error:', 'Failed to load dataset');
        alert('Fetch error: Failed to load dataset' );

        // Hide loading indicator in case of an error
        document.getElementById('loadingOverlay').style.display = 'none';
        if (callback) {
            callback();
        }
    });
}

function handleCSVData(csvData) {
    // For simplicity, let's assume you want to download the CSV file
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    // Create a link element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Clear the drop area
    clearDropArea();
}

function clearDropArea() {
    const dropArea = document.getElementById('drop-area');
    dropArea.innerHTML = `<p>Drag and drop a file here <br> or <br>click to select <br>(only .csv file)</p>`;
}

function submitForm(event) {
    event.preventDefault();

    // Collect form data
    var age = document.getElementById('input-age').querySelector('input').value;

    var formData = {
        Sex: getRadioValue('sex'),
        GeneralHealth: document.getElementById('general-health').value,
        PhysicalActivities: getRadioValue('physical-activities'),
        SleepHours: parseInt(document.getElementById('input-sleep-hours').querySelector('input').value, 10),
        DifficultyWalking: getRadioValue('difficulty-walking'),
        SmokerStatus: document.getElementById('smoker').value,
        AgeCategory: convertAgeToCategory(age),
        Weight: parseInt(document.getElementById('input-weight').querySelector('input').value, 10),
        Height: parseInt(document.getElementById('input-height').querySelector('input').value, 10),
        AlcoholDrinkers: getRadioValue('alcohol-drinkers')
    };

    for (var key in formData) {
        if (formData[key] === null || formData[key] === "") {
            alert('Please fill in all required fields.');
            return;
        }
    }

    Req(formData);
}

function getRadioValue(name) {
    var radioButtons = document.getElementsByName(name);

    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            return radioButtons[i].value;
        }
    }

    // If no radio button is checked, return null or handle accordingly
    return null;
}

function loadPageDoctor() {
    const content = document.getElementById("content");
    content.parentNode.removeChild(content);
    const newContent = document.createElement('div');
    newContent.id = 'content';

    // Create form element
    var form = document.createElement('form');
    form.id = 'myForm';
    form.enctype = 'multipart/form-data';

    form.innerHTML = `
    <div id="drop-area" ondrop="dropHandler(event)" ondragover="dragOverHandler(event)" ondragenter="dragEnterHandler(event)" ondragleave="dragLeaveHandler(event)" onclick="selectFile()">
        <p>Drag and drop a file here <br> or <br>click to select <br>(only .csv file)</p>
    </div>
    <input type="file" id="fileInput" onchange="handleFiles(this.files)" accept=".csv" multiple>
    <div id="button-upload">
        <button class="btn btn-primary" id="uploadButton" type="button" onclick="uploadFile()">Upload</button>
    </div>
    `
    newContent.append(form);
    document.getElementById('container').appendChild(newContent);
}

function loadPagePersonal() {
    const content = document.getElementById("content");
    content.parentNode.removeChild(content);
    const newContent = document.createElement('div');
    newContent.id = 'content';

    var form = document.createElement('form');
    form.setAttribute('id', 'myForm');
    form.setAttribute('onsubmit', 'submitForm(event)');
    form.setAttribute('class', 'was-validated')

    form.innerHTML = `
    <div id="container-form">
        <div id="binary-form">
            <div id="input-sex">
                <div class="label-input">Sex</div>
                <div>
                    <input class="form-check-input mt-1" type="radio" value="Male" name="sex" required>
                    <label for="male">Male</label>
                    <input class="form-check-input mt-1" type="radio" value="Female" name="sex" required>
                    <label for="female">Female</label>
                </div>
            </div>
            <div id="input-physical-activities">
                <div class="label-input">Physical Activities</div>
                <div>
                    <input class="form-check-input mt-1" type="radio" value="Yes" name="physical-activities" required>
                    <label for="yes">Yes</label>
                    <input class="form-check-input mt-1" type="radio" value="No" name="physical-activities" required>
                    <label for="no">No</label>
                </div>

            </div>
            <div id="input-difficulty-walking">
                <div class="label-input">Difficulty Walking</div>
                <div>
                    <input class="form-check-input mt-1" id="yes-walking" type="radio" value="Yes"
                        name="difficulty-walking" required>
                    <label for="yes">Yes</label>
                    <input class="form-check-input mt-1" id="no-walking" type="radio" value="No"
                        name="difficulty-walking" required>
                    <label for="no">No</label>
                </div>
            </div>
            <div id="input-alcohol-drinkers">
                <div class="label-input">Alcohol Drinkers</div>
                <div>
                    <input class="form-check-input mt-1" id="yes-drinkers" type="radio" value="Yes"
                        name="alcohol-drinkers" required>
                    <label for="yes">Yes</label>
                    <input class="form-check-input mt-1" id="no-drinkers" type="radio" value="No"
                        name="alcohol-drinkers" required>
                    <label for="no">No</label>
                </div>
            </div>
        </div>
        <div id="category-form">
            <div class="col-md-5" id="input-general-health">
                <label for="validationCustom04" class="form-label label-input">General health</label>
                <select class="form-select" id="general-health" name="general-health" required>
                    <option value="Poor">Poor</option>
                    <option value="Fair">Fair</option>
                    <option value="Good">Good</option>
                    <option value="Very good">Very good</option>
                    <option value="Excellent">Excellent</option>
                </select>
            </div>
            <div class="col-md-5" id="input-smoker-status">
                <label for="validationCustom04" class="form-label label-input">Smoker Status</label>
                <select class="form-select" id="smoker" name="smoker" required>
                <option value="Never smoked">Never smoked</option>
                    <option value="Former smoker">Former smoker</option>
                    <option value="Current smoker - now smokes some days">Current smoker - now smokes some days</option>
                    <option value="Current smoker - now smokes every day">Current smoker - now smokes every day</option>
                </select>
            </div>
        </div>
        <div id="numerical-form">
            <div class="inside-numerical-form">
                <div class="col-md-5" id="input-sleep-hours">
                    <label for="validationCustom03" class="form-label label-input">Sleep Hours</label>
                    <input type="number" class="form-control" id="input-sleep-hours" min="0" required>
                </div>
                <div class="col-md-5" id="input-age">
                    <label for="validationCustom03" class="form-label label-input">Age</label>
                    <input type="number" class="form-control" id="input-age" min="0" required>
                </div>
            </div>
            <div class="inside-numerical-form">
                <div class="col-md-5" id="input-weight">
                    <label for="validationCustom03" class="form-label label-input">Weight(Kg)</label>
                    <input type="number" class="form-control" id="input-weight" min="0" required>
                </div>
                <div class="col-md-5" id="input-height">
                    <label for="validationCustom03" class="form-label label-input">Height(Cm)</label>
                    <input type="number" class="form-control" id="input-height" min="0" required>
                </div>
            </div>
        </div>
    </div>
    <div id="button">
        <button class="btn btn-primary mt-2" type="submit">Submit</button>
    </div>
    `

    newContent.append(form);
    document.getElementById('container').appendChild(newContent);
}

function uploadFile() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];
    var uploadButton = document.getElementById('uploadButton');

    if (file) {
        // Change button text to "Uploading"
        uploadButton.textContent = 'Uploading...';

        // Show loading indicator
        document.getElementById('loadingOverlay').style.display = 'block';

        // Create a new FileReader instance
        var reader = new FileReader();

        // Define a callback function to be executed when the file is loaded
        reader.onload = function(event) {
            // Parse the CSV content
            var csv = event.target.result;
            var lines = csv.split('\n');

            // Modify the header line
            lines[0] = lines[0].replace('Age', 'AgeCategory');

            // Loop through each line (except the header)
            for (var i = 1; i < lines.length; i++) {
                var columns = lines[i].split(',');

                // Convert age to age category
                var age = parseInt(columns[6]);
                var ageCategory = getAgeCategory(age);
                columns[6] = ageCategory;

                // Reconstruct the line with modified age category
                lines[i] = columns.join(',');
            }

            // Reconstruct the modified CSV content
            var modifiedCSV = lines.join('\n');
            // Call ReqFile with modified CSV content
            var modFile = new Blob([modifiedCSV], { type: 'text/csv' });
            modFile.name = file.name;
            console.log(modFile);
            console.log(file)
            ReqFile(modFile, function () {
                // Change predict button text back to "Upload" after upload is complete
                uploadButton.textContent = 'Upload';
                // Clear the uploaded file
                clearFileInput(fileInput);
                clearDropArea();
            });
        };

        // Read the file as text
        reader.readAsText(file);
    } else {
        alert('Please choose a file to upload.');
    }
}

// Function to convert age to age category
function getAgeCategory(age) {
    if (age >= 80) {
        return 'Age 80 or older';
    } else if (age >= 75 && age < 80) {
        return 'Age 75 to 79';
    } else if (age >= 70 && age < 75) {
        return 'Age 70 to 74';
    } else if (age >= 65 && age < 70) {
        return 'Age 65 to 69';
    } else if (age >= 60 && age < 65) {
        return 'Age 60 to 64';
    } else if (age >= 55 && age < 60) {
        return 'Age 55 to 59';
    } else if (age >= 50 && age < 55) {
        return 'Age 50 to 54';
    } else {
        return 'Under 50';
    }
}

function clearFileInput(fileInput) {
    // Create a new file input element
    var newFileInput = document.createElement('input');
    newFileInput.type = 'file';
    newFileInput.id = 'fileInput';
    newFileInput.accept = '.csv';
    newFileInput.onchange = function() {
        handleFiles(this.files);
    };

    // Replace the existing file input element with the new one
    fileInput.parentNode.replaceChild(newFileInput, fileInput);
}

function createRadioInput(parentNode, name, value, label) {
    var radioInput = document.createElement('input');
    radioInput.setAttribute('type', 'radio');
    radioInput.setAttribute('value', value);
    radioInput.setAttribute('name', name);
    radioInput.setAttribute('class', 'form-check-input mt-1');

    var labelElement = document.createElement('label');
    labelElement.setAttribute('for', value);
    labelElement.textContent = label;

    parentNode.appendChild(radioInput);
    parentNode.appendChild(labelElement);
}

// Function to create select input elements
function createSelectInput(id, name, options) {
    var selectInput = document.createElement('select');
    selectInput.setAttribute('class', 'form-select');
    selectInput.setAttribute('id', id);
    selectInput.setAttribute('name', name);
    selectInput.setAttribute('required', 'true');

    for (var i = 0; i < options.length; i++) {
        var option = document.createElement('option');
        option.setAttribute('value', options[i]);
        option.textContent = options[i];
        selectInput.appendChild(option);
    }

    return selectInput;
}

// Function to create numerical input elements
function createNumericalInput(type, id, label) {
    var inputElement = document.createElement('input');
    inputElement.setAttribute('type', type);
    inputElement.setAttribute('class', 'form-control');
    inputElement.setAttribute('id', id);
    inputElement.setAttribute('required', 'true');

    var labelElement = document.createElement('label');
    labelElement.setAttribute('for', id);
    labelElement.setAttribute('class', 'form-label');
    labelElement.textContent = label;

    var divContainer = document.createElement('div');
    divContainer.setAttribute('class', 'col-md-5');
    divContainer.appendChild(labelElement);
    divContainer.appendChild(inputElement);

    return divContainer;
}

function createDivBinary(label, id, value1, label1, value2, label2) {
    input = document.createElement('div');
    input.id = 'input-' + id;
    var inner = document.createElement('div');
    inner.innerText = label;
    input.appendChild(inner);
    var tmpDiv = document.createElement('div');
    createRadioInput(tmpDiv, id, value1, label1);
    createRadioInput(tmpDiv, id, value2, label2);
    input.append(tmpDiv);

    return input;
}

function dragOverHandler(event) {
    event.preventDefault();
    document.getElementById('drop-area').classList.add('highlight');
}

function dragEnterHandler(event) {
    event.preventDefault();
    document.getElementById('drop-area').classList.add('highlight');
}

function dragLeaveHandler(event) {
    event.preventDefault();
    document.getElementById('drop-area').classList.remove('highlight');
}

function dropHandler(event) {
    event.preventDefault();
    document.getElementById('drop-area').classList.remove('highlight');

    const files = event.dataTransfer.files;
    handleFiles(files);
}

function selectFile() {
    document.getElementById('fileInput').click();
}

function handleFiles(files) {
    const output = document.getElementById('drop-area');
    output.innerHTML = '';

    for (const file of files) {
        output.innerHTML += `<p>${file.name} (${formatSize(file.size)})</p>`;
        readFile(file);
    }
}

function readFile(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        // The file content is available here as e.target.result
        console.log('File content:', e.target.result);
    };

    reader.readAsText(file);
}

function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function convertAgeToCategory(age) {
    const ageRanges = {
        'Age 65 to 69': [65, 69],
        'Age 70 to 74': [70, 74],
        'Age 75 to 79': [75, 79],
        'Age 80 or older': [80, Infinity],
        'Age 50 to 54': [50, 54],
        'Age 40 to 44': [40, 44],
        'Age 60 to 64': [60, 64],
        'Age 55 to 59': [55, 59],
        'Age 45 to 49': [45, 49],
        'Age 35 to 39': [35, 39],
        'Age 25 to 29': [25, 29],
        'Age 30 to 34': [30, 34],
        'Age 18 to 24': [0, 24]
    };

    for (const [category, range] of Object.entries(ageRanges)) {
        if (age >= range[0] && age <= range[1]) {
            return category;
        }
    }

    // If the age does not fall into any specified range, you may handle it according to your requirements.
    return null;
}

function handleResponse(jsonData) {
    var data = JSON.parse(jsonData.result);
    var value = parseInt(data[0]);
    var result = (value===1)? 'You have a chance of having heart attack.' : 'You are not having a heart attack.'

    console.log(result);
    showMessage(result);
}

function showMessage(message) {
    var centerMessage = document.getElementById("centerMessage");
    var messageContent = document.getElementById("messageContent");
    messageContent.innerHTML = message;
    centerMessage.style.display = "block"; // Show the message
}

// Function to hide the message
function hideMessage() {
    document.getElementById("centerMessage").style.display = "none";
}

window.onload = loadPagePersonal