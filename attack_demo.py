import requests
import time

# Target endpoint
URL = "http://localhost:5002/api/interactions"

# --- Credential Stuffing Simulation ---
usernames = ["admin", "user", "test", "guest", "demo"]
passwords = ["1234", "password", "admin123", "guest", "letmein"]

print("\n--- Credential Stuffing Simulation ---")
for i in range(len(usernames)):
    payload = {
        "type": "login_failed",
        "data": {
            "username": usernames[i],
            "password": passwords[i]
        }
    }
    response = requests.post(URL, json=payload)
    print(f"[{i+1}] Attempted login with {usernames[i]}/{passwords[i]} → {response.status_code}")
    time.sleep(0.5)

# --- SQL Injection Simulation ---
sql_payloads = [
    "' OR '1'='1",
    "' OR 1=1 --",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "' OR '' = '"
]

print("\n--- SQL Injection Simulation ---")
for i, injection in enumerate(sql_payloads):
    payload = {
        "type": "login_attempt",
        "data": {
            "username": injection,
            "password": "anything"
        }
    }
    response = requests.post(URL, json=payload)
    print(f"[{i+1}] Sent SQL injection: {injection} → {response.status_code}")
    time.sleep(0.5)
