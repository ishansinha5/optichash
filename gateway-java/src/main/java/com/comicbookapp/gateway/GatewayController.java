package com.comicbookapp.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class GatewayController {

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper mapper = new ObjectMapper();

    // Internal Docker network addresses
    private final String CPP_BOUNCER_URL = "http://phash_bouncer:8081/api/analyze-cover";
    private final String PYTHON_BRAIN_URL = "http://ml_vision:8000/predict-cover";

    @PostMapping("/process-comic")
    public ResponseEntity<String> processComic(@RequestParam("file") MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();

            // 1. Send the raw binary to the hardware-aware C++ Bouncer
            HttpHeaders cppHeaders = new HttpHeaders();
            cppHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            HttpEntity<byte[]> cppRequest = new HttpEntity<>(fileBytes, cppHeaders);
            
            ResponseEntity<String> cppResponse = restTemplate.postForEntity(CPP_BOUNCER_URL, cppRequest, String.class);
            JsonNode cppJson = mapper.readTree(cppResponse.getBody());

            // 2. The Decision Tree: Evaluate the Bouncer's response
            if ("cached_hit".equals(cppJson.get("status").asText())) {
                System.out.println("[GATEWAY] Optimization achieved. Bypassing Python.");
                return ResponseEntity.ok(cppResponse.getBody());
            }

            System.out.println("[GATEWAY] Cache miss. Forwarding compute load to Python PyTorch container.");

            // 3. Fallback: Send multipart data to Python
            HttpHeaders pythonHeaders = new HttpHeaders();
            pythonHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            HttpEntity<MultiValueMap<String, Object>> pythonRequest = new HttpEntity<>(body, pythonHeaders);
            ResponseEntity<String> pythonResponse = restTemplate.postForEntity(PYTHON_BRAIN_URL, pythonRequest, String.class);

            return ResponseEntity.ok(pythonResponse.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"status\": \"error\", \"message\": \"Gateway failure\"}");
        }
    }
}