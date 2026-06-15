import io
import torch
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision.transforms import v2
from core.model import GreenComicVision
import uvicorn
# Import torchao configuration tools
from torchao.quantization import quantize_, Int8DynamicActivationInt8WeightConfig

app = FastAPI()

# Enable CORS so your local frontend server can communicate with your backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local testing servers to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cpu")
print(f"Inference Engine booting on: {device}")

# 1. Initialize the structure matching your 6-class architecture
model = GreenComicVision(num_classes=6)

# 2. Inject the torchao layer shell BEFORE loading the weights
quantize_(model, Int8DynamicActivationInt8WeightConfig())

# 3. Load your ultra-efficient INT8 model weights securely
weights_path = "weights/comic_vision_int8.pth"
try:
    model.load_state_dict(torch.load(weights_path, map_location=device))
    print(f"SUCCESS: Loaded optimized Green AI weights from {weights_path}")
except Exception as e:
    print(f"ERROR loading weights: {e}")

model.to(device)
model.eval()
# 3. The Green AI Preprocessing Pipeline
preprocess = v2.Compose([
    v2.Resize((224, 224)),
    v2.ToImage(),
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.post("/process")  
async def process_comic(file: UploadFile = File(...)):
    try:
        # 1. Catch the multipart bytes from Java and convert to a PIL Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # 2. Apply preprocessing and add the Batch Dimension
        input_tensor = preprocess(image).unsqueeze(0).to(device)
        
        # 3. Execute Neural Network Inference
        with torch.no_grad():  # CRITICAL: Disables gradient tracking to save memory/CPU
            outputs = model(input_tensor)
            _, predicted = torch.max(outputs, 1)
            predicted_id = predicted.item()

        # 4. Return the exact JSON contract your architecture expects
        return {
            "status": "success",
            "optimization_route": "inference_python",
            "predicted_id": predicted_id,
            "compute_cycles_saved": 0 # We will update this after INT8 Quantization
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)