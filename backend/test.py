import requests

# Define the URL of your FastAPI server endpoint
url = 'http://localhost:8888/predict_csv'

# Define the path to the CSV file you want to upload
file_path = 'backend/test.csv'

# Open the CSV file in binary mode
with open(file_path, 'rb') as file:
    # Prepare the files dictionary with the file object
    files = {'file': file}

    # Send the POST request with the files dictionary
    response = requests.post(url, files=files)

# Print the response from the server
print()
print(response.text)
