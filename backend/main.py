from fastapi import FastAPI, HTTPException , File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import csv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify specific origins instead of ""
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def get_health():
    return {
            "code"      : 200,
            "message"   : "Good",
        }

model = joblib.load('model.joblib')

class UserData(BaseModel):
    Sex: str
    GeneralHealth: str
    PhysicalActivities: str
    SleepHours: int
    DifficultyWalking: str
    SmokerStatus: str
    AgeCategory: str
    Weight: float
    Height: float
    AlcoholDrinkers: str

def __preprocess_data(data_df):
    # Data preprocess
    data_pre = pd.DataFrame()
    for column in data_df.columns:
        data_pre[column.split(',')[0].strip()] = data_df[column].apply(lambda x: x[1])

    sex_order = ['Female','Male']
    data_pre['Sex'] = pd.Categorical(data_pre['Sex'], categories=sex_order, ordered=True)
    data_pre['Sex'] = data_pre['Sex'].cat.codes

    yesno_order = ['No','Yes']
    col_to_labelencode = ['PhysicalActivities', 'DifficultyWalking', 'AlcoholDrinkers']
    for col in col_to_labelencode:
        data_pre[col] = pd.Categorical(data_pre[col], categories=yesno_order, ordered=True)
        data_pre[col] = data_pre[col].cat.codes

    health_order = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']
    data_pre['GeneralHealth'] = pd.Categorical(data_pre['GeneralHealth'], categories=health_order, ordered=True)
    data_pre['GeneralHealth'] = data_pre['GeneralHealth'].cat.codes

    age_categories = ['Age 65 to 69', 'Age 70 to 74', 'Age 75 to 79', 'Age 80 or older',
                      'Age 50 to 54', 'Age 40 to 44', 'Age 60 to 64', 'Age 55 to 59',
                      'Age 45 to 49', 'Age 35 to 39', 'Age 25 to 29', 'Age 30 to 34', 'Age 18 to 24']
    for age_cat in age_categories:
        data_pre[age_cat] = (data_pre['AgeCategory'] == age_cat).astype(int)

    data_pre.drop('AgeCategory', axis=1, inplace=True)

    smoking_status_cols = ['Former smoker', 'Never smoked', 'Current smoker - now smokes every day', 'Current smoker - now smokes some days']
    for status in smoking_status_cols:
        data_pre[status] = (data_pre['SmokerStatus'] == status).astype(int)

    # Drop original smoking status column
    data_pre.drop('SmokerStatus', axis=1, inplace=True)

    # Change Column name
    for col in age_categories:
        data_pre = data_pre.rename(columns={col : f'AgeCategory_{col}'})

    for col in smoking_status_cols:
        data_pre = data_pre.rename(columns={col : f'SmokerStatus_{col}'})

    # Calculate BMI
    # BMI = WEIGHT(KG) / (HEIGHT)(M^2)
    data_pre['BMI'] = (data_pre['Weight'] / ((data_pre['Height'] / 100) ** 2)).round(2)
    data_pre.drop(['Weight', 'Height'], axis=1, inplace=True)

    # Reposition
    new_column_order = [
        'Sex', 'GeneralHealth', 'PhysicalActivities', 'SleepHours',
        'DifficultyWalking', 'BMI', 'AlcoholDrinkers',
        'SmokerStatus_Current smoker - now smokes every day',
        'SmokerStatus_Current smoker - now smokes some days',
        'SmokerStatus_Former smoker', 'SmokerStatus_Never smoked',
        'AgeCategory_Age 18 to 24', 'AgeCategory_Age 25 to 29',
        'AgeCategory_Age 30 to 34', 'AgeCategory_Age 35 to 39',
        'AgeCategory_Age 40 to 44', 'AgeCategory_Age 45 to 49',
        'AgeCategory_Age 50 to 54', 'AgeCategory_Age 55 to 59',
        'AgeCategory_Age 60 to 64', 'AgeCategory_Age 65 to 69',
        'AgeCategory_Age 70 to 74', 'AgeCategory_Age 75 to 79',
        'AgeCategory_Age 80 or older'
    ]

    # Reindex the DataFrame with the new column order
    data_pre = data_pre.reindex(columns=new_column_order)
    print(data_pre)

    return data_pre

@app.post("/predict", response_model=dict, status_code=200)
async def predict(data: UserData):
    input_df = pd.DataFrame([data],columns=['Sex','GeneralHealth','PhysicalActivities','SleepHours','DifficultyWalking','SmokerStatus','AgeCategory','Weight','Height','AlcoholDrinkers'])
    X = __preprocess_data(input_df)
    pred = model.predict(X)
    print(pred)
    return {"result": f'{pred}'}

@app.post("/predict_csv")
async def predict(file: UploadFile = File(...)):
    # Check if the uploaded file is a CSV
    if file.filename.endswith(".csv"):
        # Read the contents of the CSV file
        contents = await file.read()
        
        # Process the CSV file
        rows = []
        with open(file.filename, "r") as csv_file:
            csv_reader = csv.reader(csv_file)
            for row in csv_reader:
                rows.append(row)
        
        # Here you can do further processing with the rows
        return {"file_name": file.filename, "rows": rows}
    else:
        return {"error": "Uploaded file is not a CSV."}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="localhost",port=8888)