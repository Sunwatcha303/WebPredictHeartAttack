function Req(requestData) {
    // Replace 'your_api_endpoint' with the actual API endpoint URL
    const apiUrl = 'http://localhost:8888/predict';

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


    }).catch(error => {
        console.error('Fetch error:', error);
    });
}

function ReqFile(requestData) {
    // Replace 'your_api_endpoint' with the actual API endpoint URL
    const apiUrl = 'http://localhost:8888/predict';

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', requestData); // Assuming requestData is the CSV file

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
        return response.json();
    }).then(data => {
        // Handle the API response here
        console.log('API response:', data);
        handleCSVData(data);
    }).catch(error => {
        console.error('Fetch error:', error);
    });
}

function handleCSVData(csvData) {
    // For simplicity, let's assume you want to download the CSV file
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    // Create a link element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'response.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function submitForm(event) {
    event.preventDefault();

    // Collect form data
    var formData = {
        sex: getRadioValue('sex'),
        generalHealth: document.getElementById('general-health').value,
        physicalActivities: getRadioValue('physical-activities'),
        sleepHours: document.getElementById('input-sleep-hours').querySelector('input').value,
        difficultyWalking: getRadioValue('difficulty-walking'),
        smokerStatus: document.getElementById('smoker').value,
        age: document.getElementById('input-age').querySelector('input').value,
        weight: document.getElementById('input-weight').querySelector('input').value,
        height: document.getElementById('input-height').querySelector('input').value,
        alcoholDrinkers: getRadioValue('alcohol-drinkers')
    };

    for (var key in formData) {
        if (formData[key] === null || formData[key] === "") {
            alert('Please fill in all required fields.');
            return;
        }
    }

    // Convert the JavaScript object to a JSON string
    var jsonData = JSON.stringify(formData);

    console.log('Form Data (JSON):', jsonData);

    Req(jsonData);
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
    form.id = 'uploadForm';
    form.enctype = 'multipart/form-data';

    // Create label element
    var label = document.createElement('label');
    label.setAttribute('for', 'fileInput');
    label.textContent = 'Choose a file:';

    // Create input element for file upload
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileInput';
    fileInput.name = 'fileInput';
    fileInput.accept = '.jpg, .jpeg, .png';

    // Create button element
    var uploadButton = document.createElement('button');
    uploadButton.type = 'button';
    uploadButton.textContent = 'Upload';
    uploadButton.onclick = uploadFile; // Assign the function to the button click event

    // Append elements to the form
    form.appendChild(label);
    form.appendChild(fileInput);
    form.appendChild(uploadButton);

    newContent.append(form);
    document.getElementById('container').appendChild(newContent);
}

function loadPagePersonal() {
    const content = document.getElementById("content");
    content.parentNode.removeChild(content);
    const newContent = document.createElement('div');
    newContent.id = 'content';

    // Create form element
    var form = document.createElement('form');
    form.id = 'myForm';
    form.addEventListener('submit', submitForm);

    // Create Sex input
    var inputSex = document.createElement('div');
    inputSex.id = 'input-sex';
    inputSex.innerHTML = `
        <div>Sex</div>
        <label for="male">Male</label>
        <input type="radio" id="male" name="sex" value="male">

        <label for="female">Female</label>
        <input type="radio" id="female" name="sex" value="female">
    `;
    form.appendChild(inputSex);

    // Create General Health input
    var inputGeneralHealth = document.createElement('div');
    inputGeneralHealth.id = 'input-general-health';
    inputGeneralHealth.innerHTML = `
        <div>General Health</div>
        <select id="general-health" name="general-health">
            <option value="Poor">Poor</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Very good">Very good</option>
        </select>
    `;
    form.appendChild(inputGeneralHealth);

    // Create Physical Activities input
    var inputPhysicalActivities = document.createElement('div');
    inputPhysicalActivities.id = 'input-physical-activities';
    inputPhysicalActivities.innerHTML = `
        <div>Physical Activities</div>
        <label for="yes-activities">Yes</label>
        <input type="radio" id="yes-activities" name="physical-activities" value="yes">

        <label for="no-activities">No</label>
        <input type="radio" id="no-activities" name="physical-activities" value="no">
    `;
    form.appendChild(inputPhysicalActivities);

    // Create Sleep Hours input
    var inputSleepHours = document.createElement('div');
    inputSleepHours.id = 'input-sleep-hours';
    inputSleepHours.innerHTML = `
        <div>Sleep Hours</div>
        <input type="number">
    `;
    form.appendChild(inputSleepHours);

    var inputDifficultyWalking = document.createElement('div');
    inputDifficultyWalking.id = 'input-difficulty-walking';
    inputDifficultyWalking.innerHTML = `
                <div>Difficulty Walking</div>
                <label for="yes-walking">Yes</label>
                <input type="radio" id="yes-walking" name="difficulty-walking" value="yes">
        
                <label for="no-walking">No</label>
                <input type="radio" id="no-walking" name="difficulty-walking" value="no">
            `;
    form.appendChild(inputDifficultyWalking);

    // Create Smoker Status input
    var inputSmokerStatus = document.createElement('div');
    inputSmokerStatus.id = 'input-smoker-status';
    inputSmokerStatus.innerHTML = `
                <div>Smoker Status</div>
                <select id="smoker" name="smoker">
                    <option value="Former smoker">Former smoker</option>
                    <option value="Never smoked">Never smoked</option>
                    <option value="Current smoker - now smokes every day">Current smoker - now smokes every day</option>
                </select>
            `;
    form.appendChild(inputSmokerStatus);

    // Create Age input
    var inputAge = document.createElement('div');
    inputAge.id = 'input-age';
    inputAge.innerHTML = `
                <div>Age</div>
                <input type="number">
            `;
    form.appendChild(inputAge);

    // Create Weight input
    var inputWeight = document.createElement('div');
    inputWeight.id = 'input-weight';
    inputWeight.innerHTML = `
                <div>Weight(Kg)</div>
                <input type="number">
            `;
    form.appendChild(inputWeight);

    // Create Height input
    var inputHeight = document.createElement('div');
    inputHeight.id = 'input-height';
    inputHeight.innerHTML = `
                <div>Height(Cm)</div>
                <input type="number">
            `;
    form.appendChild(inputHeight);

    // Create Alcohol Drinkers input
    var inputAlcoholDrinkers = document.createElement('div');
    inputAlcoholDrinkers.id = 'input-alcohol-drinkers';
    inputAlcoholDrinkers.innerHTML = `
                <div>Alcohol Drinkers</div>
                <label for="yes-drinkers">Yes</label>
                <input type="radio" id="yes-drinkers" name="alcohol-drinkers" value="yes">
        
                <label for="no-drinkers">No</label>
                <input type="radio" id="no-drinkers" name="alcohol-drinkers" value="no">
            `;
    form.appendChild(inputAlcoholDrinkers);

    // Repeat the process for the remaining input elements...

    // Create Submit button
    var submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    form.appendChild(submitButton);

    newContent.append(form);
    document.getElementById('container').appendChild(newContent);
}

function uploadFile() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (file) {
        // Your file upload logic here
        ReqFile(file);
        console.log(file);
    } else {
        alert('Please choose a file to upload.');
    }
}