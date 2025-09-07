AI Workflow Backend (FastAPI)
A backend service for an AI-powered workflow application, supporting document uploads (PDFs), LLM configuration, and workflow validation. It is designed to integrate with a React frontend.

Features
PDF Upload and Processing: Extracts text from user-uploaded PDFs.

Gemini LLM Integration: Configurable AI model via Google Generative AI.

Workflow Validation: Validates AI workflow structure and connections.

CORS Enabled: Ready for local React frontend and remote development.

Requirements
Python 3.9+

pip

git

Arch Linux or any modern Linux distribution

Getting Started
1. Clone the Repository
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

2. Install Dependencies
Create a virtual environment (recommended):

python -m venv venv
source venv/bin/activate

Install requirements:

pip install -r requirements.txt

3. Environment Setup
Copy the example environment file and set your API key.

cp .env.example .env

Edit the .env file and set your API key:

GEMINI_API_KEY=your_gemini_api_key_here

Usage
1. Run the Server
To allow access within your private network (from other devices), bind to all interfaces:

uvicorn main:app --host 0.0.0.0 --port 8000

Replace main:app if your FastAPI app is defined in a different file (e.g., backend:app).

2. Accessing The API
From your local machine: http://localhost:8000/

From other devices: http://<your-server-ip>:8000/

To find your server’s IP, run:

ip a

(Look for your LAN/intranet address, e.g., 192.168.x.y)

3. CORS and Frontend Setup
The backend’s default CORS settings allow requests from:

http://localhost:3000

http://127.0.0.1:3000

Any origin (*) for development purposes.

No configuration is needed for a local React frontend (which typically defaults to port 3000). For production, you must restrict allow_origins as needed in main.py.

API Endpoints
Method

Endpoint

Description

GET

/

Health check

POST

/api/upload-document

Upload and process a PDF file

GET

/api/documents

List uploaded PDFs

DELETE

/api/documents/{filename}

Delete a PDF file

POST

/api/llm-config

Save LLM configuration

GET

/api/llm-config/{node_id}

Get LLM configuration for a node

POST

/api/search

Perform AI-powered search

POST

/api/validate-workflow

Validate workflow structure

Development Notes
Firewalls: You may need to open port 8000 on your firewall if you are accessing the server remotely.

Security: This setup is for development only. Never use allow_origins=["*"] in a production environment.

Uploaded PDFs are stored in memory and are volatile.

License
[Specify your license here, e.g., MIT, Apache 2.0]
