import requests
from time import sleep
requests.post("http://localhost:5000/send_text",
              json={"text": "hello"})
