import requests

login_url = "http://localhost:5178/api/auth/login"
login_data = {
    "username": "owner@bizflow.com",
    "password": "owner123"
}
res = requests.post(login_url, json=login_data)
if res.status_code == 200:
    token = res.json()["token"]
    print("Token obtained")
    stores_url = "http://localhost:5178/api/stores"
    headers = {"Authorization": f"Bearer {token}"}
    res2 = requests.get(stores_url, headers=headers)
    print("GET /api/stores status:", res2.status_code)
    print(res2.text)
else:
    print("Login failed", res.status_code, res.text)
