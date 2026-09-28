import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

API_KEY = os.getenv("HINDSIGHT_API_KEY")
BASE_URL = os.getenv(
    "HINDSIGHT_BASE_URL",
    "https://api.hindsight.vectorize.io"
)

BANK_ID = os.getenv(
    "HINDSIGHT_BANK_ID",
    "accounts-payable-agent"
)

client = Hindsight(
    base_url=BASE_URL,
    api_key=API_KEY
)

print("Hindsight client created successfully!")
client.create_bank(
    bank_id=BANK_ID,
    name="Accounts Payable Agent"
)

print("Hindsight memory bank created successfully!")