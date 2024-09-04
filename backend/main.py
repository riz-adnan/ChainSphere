from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

# Importing the routes
import routes as rt

# Allowing frontend to access the backend
origins = ['http://localhost:3000']

app = FastAPI()

# Adding the CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# Adding the routes
app.include_router(rt.router)