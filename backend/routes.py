from fastapi import APIRouter, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader
from io import BytesIO
import io
import ipfshttpclient

router = APIRouter()


@router.post('/get_pdf_text')
async def get_pdf_text(file: UploadFile = File(None)):
    print("The desired file is: ", file)
    raw_text = ""
    if file:
        try:
            pdf_bytes = await file.read()
            reader = PdfReader(BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            raw_text += text
        except Exception as e:
            raw_text = f"Error reading file: {e}"
        print("The raw text is: ", raw_text)
        if raw_text:
            return JSONResponse({'output': raw_text})
        else:
            return JSONResponse({'output': "No file given"})
    else:
        return JSONResponse({'output': "No file given"})

@router.post('/get_img_hash')
async def get_img_hash(file: UploadFile = File(None)):
    try:
        print("The desired file is: ", file)
        # Connect to the IPFS HTTP API
        client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')  # Default IPFS API address

        # Create a file-like object from bytes
        file_obj = io.BytesIO(file)

        # Upload the image file to IPFS
        res = client.add(file_obj)

        # Return the IPFS hash of the added image
        return JSONResponse(content={'output': res['Hash']}, status_code=200)

    except Exception as e:
        print("The error is: ", e)
        return JSONResponse(content={'output': str(e)}, status_code=500)