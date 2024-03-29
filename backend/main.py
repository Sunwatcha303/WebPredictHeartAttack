from fastapi import FastAPI, HTTPException , File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.responses import Response
import pandas as pd
import joblib
import sys

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
        } , 200


try:
    model = joblib.load('backend/model.joblib')
except FileNotFoundError:
    print("Error: Model file not found.")
    sys.exit(1)

try:
    scaler = joblib.load('backend/scaler.joblib')
except FileNotFoundError:
    print("Error: Model file not found.")
    sys.exit(1)

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

def __changeformat(data_df):
    data_pre = pd.DataFrame()
    for column in data_df.columns:
        data_pre[column.split(',')[0].strip()] = data_df[column].apply(lambda x: x[1])
    return data_pre

def __preprocess_data(data_pre):
    # Data preprocess
    #LabelEncoder
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

    #One Hot Encoder
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

    #MaxMinScaler
    numeric_cols = ['SleepHours','BMI']
    data_to_scale = data_pre[numeric_cols]
    scaled_data = scaler.fit_transform(data_to_scale)

    data_pre[numeric_cols] = scaled_data

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

@app.post("/predict")
async def predict(data: UserData):
    input_df = pd.DataFrame([data],columns=['Sex','GeneralHealth','PhysicalActivities','SleepHours','DifficultyWalking','SmokerStatus','AgeCategory','Weight','Height','AlcoholDrinkers'])
    useinput = input_df.copy()
    pre_input = __changeformat(useinput)
    X = __preprocess_data(pre_input)
    pred = model.predict(X)
    print(pred)
    return {"result": f'{pred}'}

@app.post("/predict_csv")
async def predict(file: UploadFile = File(...)):
    # Check if the uploaded file is a CSV
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=404, detail="Uploaded file is not a CSV.")
    # Read the uploaded CSV file into a DataFrame
    input_df = pd.read_csv(file.file)
    useinput = input_df.copy()
    X = __preprocess_data(useinput)
    pred = model.predict(X)
    input_df['HadHeartAttack'] = pd.Series(pred).map({0: 'No', 1: 'Yes'})
    return Response(content=input_df.to_csv(index=False), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=result.csv"})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="localhost",port=8888)