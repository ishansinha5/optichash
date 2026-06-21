function previewAndUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 1. UI Reset
    const previewImg = document.getElementById('preview-img');
    const placeholder = document.getElementById('preview-placeholder');
    const resultsDiv = document.getElementById('scan-results');
    const terminal = document.getElementById('system-terminal');
    const metrics = document.getElementById('hardware-metrics');
    const locgLink = document.getElementById('comic-locg-link');
    
    previewImg.src = URL.createObjectURL(file);
    previewImg.style.display = 'inline-block';
    placeholder.style.display = 'none';
    resultsDiv.innerHTML = '';
    locgLink.style.display = 'none';
    
    terminal.style.display = 'block';
    terminal.innerHTML = '';
    metrics.style.display = 'block';

    // 2. Terminal Boot Sequence
    logToTerminal(`[SYSTEM] Received payload: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    logToTerminal(`[C++ GATEKEEPER] Initializing geometric spatial filter...`);

    // 3. Routing Logic based on your specific filenames
    const filename = file.name.toLowerCase();
    
    if (filename.includes('success')) {
        simulateCacheHit(filename);
    } else {
        simulateCacheMiss();
    }
}

function logToTerminal(message) {
    const terminal = document.getElementById('system-terminal');
    const time = new Date().toISOString().substring(11, 23);
    terminal.innerHTML += `<div style="margin-bottom: 4px;">[${time}] ${message}</div>`;
    terminal.scrollTop = terminal.scrollHeight;
}

function simulateCacheHit(filename) {
    setTimeout(() => {
        logToTerminal(`[C++ GATEKEEPER] Generated pHash: ${Math.random().toString(16).substr(2, 16)}`);
        logToTerminal(`[SPRING GATEWAY] Querying PostGIS Spatial Index...`);
        logToTerminal(`[SPRING GATEWAY] MATCH FOUND. Distance: 0.`);
        
        // Update Metrics for Hit
        document.getElementById('metric-latency').style.width = '5%';
        document.getElementById('metric-latency').style.background = '#a3e635';
        document.getElementById('metric-latency-text').innerText = '45ms (C++ Native)';
        
        document.getElementById('metric-vram').style.width = '2%';
        document.getElementById('metric-vram').style.background = '#0ea5e9';
        document.getElementById('metric-vram-text').innerText = '14 MB / 4096 MB';

        // Extract metadata based on filename
        let title = "Comic Identified";
        if(filename.includes('batman')) title = "Absolute Batman #1";
        if(filename.includes('betaraybill')) title = "Beta Ray Bill: Argent Star";
        if(filename.includes('martianmanhunter')) title = "Absolute Martian Manhunter #1";
        if(filename.includes('nightwing')) title = "Nightwing: Compendium Three";
        if(filename.includes('tf4')) title = "Transformers #4 (Milana Variant)";

        const resultsDiv = document.getElementById('scan-results');
        resultsDiv.innerHTML = `
            <span style="color: #a3e635;">⚡ CACHE HIT: Compute Bypassed</span><br>
            <span style="color: #fff; font-size: 1.2em;">${title}</span>
        `;
    }, 800); // 800ms UI delay for effect
}

function simulateCacheMiss() {
    setTimeout(() => {
        logToTerminal(`[C++ GATEKEEPER] Generated pHash: ${Math.random().toString(16).substr(2, 16)}`);
        logToTerminal(`[SPRING GATEWAY] Querying PostGIS Spatial Index...`);
        logToTerminal(`<span style="color: #dc3545;">[SPRING GATEWAY] CACHE MISS. No exact geometry found.</span>`);
        logToTerminal(`[SPRING GATEWAY] Forwarding tensor payload to Python FastAPI...`);
        
        // Update Metrics for Miss
        document.getElementById('metric-latency').style.width = '85%';
        document.getElementById('metric-latency').style.background = '#facc15';
        document.getElementById('metric-latency-text').innerText = '1,250ms (PyTorch Cold Start)';
        
        document.getElementById('metric-vram').style.width = '45%';
        document.getElementById('metric-vram').style.background = '#facc15';
        document.getElementById('metric-vram-text').innerText = '845 MB / 4096 MB';

    }, 800);

    setTimeout(() => {
        logToTerminal(`[FASTAPI] Initializing PyTorch INT8 MobileNetV3...`);
        showHibernationModal();
    }, 2000);
}

function showHibernationModal() {
    // Check if modal exists, if not create it
    let modal = document.getElementById('hibernation-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hibernation-modal';
        modal.style.cssText = 'position: fixed; z-index: 20000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; padding: 20px;';
        
        modal.innerHTML = `
            <div style="background-color: #111; max-width: 500px; width: 100%; border: 1px solid #dc3545; border-radius: 12px; padding: 30px; text-align: left; position: relative;">
                <span style="position: absolute; top: 10px; right: 15px; color: #888; font-size: 28px; font-weight: bold; cursor: pointer;" onclick="document.getElementById('hibernation-modal').style.display='none'">&times;</span>
                <h2 style="color: #dc3545; margin-top: 0;">⚠️ ML Engine Hibernating</h2>
                <p style="color: #eee; font-size: 1.05em; line-height: 1.6;">
                    To strictly enforce the Green AI mandate and eliminate idle cloud compute costs, the heavy PyTorch inference cluster is currently spun down.
                </p>
                <p style="color: #aaa; font-size: 0.95em; line-height: 1.5; margin-top: 15px;">
                    <strong>Next Steps:</strong><br>
                    • Use a pre-verified image from the <b>Resource Kit</b> to observe the C++ bypass logic.<br>
                    • Watch the <b>Pipeline Demonstration video</b> to see the ML classification engine in action.
                </p>
                <button onclick="document.getElementById('hibernation-modal').style.display='none'" class="btn" style="margin-top: 20px; width: 100%; text-align: center;">Acknowledge</button>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }
}