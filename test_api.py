import requests
import json

login_url = "http://localhost:5178/api/auth/login"
login_data = {
    "username": "owner@bizflow.com",
    "password": "owner123"
}
res = requests.post(login_url, json=login_data)
if res.status_code == 200:
    token = res.json()["token"]
    
    cash_url = "http://localhost:5178/api/cash"
    print("Fetching Cash Transactions...")
    res3 = requests.get(cash_url, headers={"Authorization": f"Bearer {token}"})
    print("Status:", res3.status_code)
    try:
        print(json.dumps(res3.json(), indent=2))
    except:
        print(res3.text)
else:
    print("Login failed", res.status_code, res.text)
