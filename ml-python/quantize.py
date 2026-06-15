import torch
import os
from core.model import GreenComicVision
# Import the modern torchao library
from torchao.quantization import quantize_, int8_dynamic_activation_int8_weight

def execute_green_ai_crunch(fp32_path="weights/comic_vision_fp32.pth", int8_path="weights/comic_vision_int8.pth"):
    print("Initiating Green AI Compression Sequence...")
    
    device = torch.device("cpu")
    
    if not os.path.exists(fp32_path):
        print(f"Error: {fp32_path} not found. You must run train.py first!")
        return

    model = GreenComicVision(num_classes=6)
    model.load_state_dict(torch.load(fp32_path, map_location=device))
    model.eval() 
    
    print("Heavy FP32 Model loaded. Applying INT8 Dynamic Quantization...")

    # The Modern 2026 Crunch (torchao)
    # This applies INT8 dynamic activation and weight quantization natively
    quantize_(model, int8_dynamic_activation_int8_weight())
    
    torch.save(model.state_dict(), int8_path)
    print("Quantization complete. INT8 Model saved.")

    fp32_size = os.path.getsize(fp32_path) / (1024 * 1024)
    int8_size = os.path.getsize(int8_path) / (1024 * 1024)
    reduction = ((fp32_size - int8_size) / fp32_size) * 100
    
    print("\n" + "="*40)
    print(" GREEN AI METRICS (PITCH DATA)")
    print("="*40)
    print(f" Original FP32 Footprint:  {fp32_size:.2f} MB")
    print(f" Optimized INT8 Footprint: {int8_size:.2f} MB")
    print(f" Total Compute Reduction:  {reduction:.1f}%")
    print("="*40 + "\n")

if __name__ == "__main__":
    execute_green_ai_crunch()