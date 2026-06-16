# Frontend Client: Edge Deployment & Telemetry

This directory contains the lightweight, zero-bloat presentation layer of the OpticHash pipeline. Hosted entirely on Vercel's edge network, it handles user inputs, image preprocessing, and direct asynchronous communication with the machine learning backend. 

## Core Web Application (HTML)

The UI is built using strict, vanilla HTML to ensure maximum compatibility and near-instant load times across mobile devices.
* **`index.html`:** The landing hub and routing matrix for the application.
* **`analyzer.html`:** The primary interface for the computer vision pipeline. It houses the file-upload and native mobile camera hooks (`capture="environment"`), the interactive modal architecture for scan training, and the empty DOM containers that `scanner.js` targets to inject live backend telemetry. 
* **`about.html`:** A static presentation page detailing the structural engineering constraints and architectural topology of the project.

## The Engine: `scanner.js`

This script is the bridge between the user's physical camera and the Hugging Face inference engine. It executes a highly specific sequence of events whenever a file state changes:

1. **Immediate UI Feedback:** The moment an image is selected, the script generates a local Blob URL (`URL.createObjectURL(file)`) to render an instant preview on the screen—preventing the UI from feeling frozen while the network request pends.
2. **Payload Packaging:** The binary image is encapsulated inside a standard `FormData()` object, ensuring it can be transmitted cleanly over HTTP without requiring heavy base64 encoding.
3. **Asynchronous Edge Communication:** The script fires an `await fetch` request to the live FastAPI endpoint (`/process`). 
4. **Logic Branching & DOM Injection:** Once the JSON response is caught, the script evaluates the routing status:
   * *Success:* It dynamically injects the Perceptual Hash match or INT8 prediction, unhides the League of Comic Geeks metadata link, and prints the exact number of `compute_cycles_saved`.
   * *Error Handling:* If the backend triggers a low-confidence threshold rejection or flags the image as the "junk" class (generic background noise), the script intercepts the error, overrides the UI with a specific visual flag (e.g., Detective Chimp or a Confused Spider-Man), and displays a user-friendly scanning correction prompt.

## Serverless Dependencies (`package.json`)

Because this project previously utilized Vercel Serverless Functions (Node.js) for backend API routing, a `package.json` file is present. It contains exactly one dependency: `"node-fetch": "^2.6.1"`. In older Node environments, the global `fetch` API was not natively available, so this package was required to allow the serverless backend to execute outgoing HTTP requests to third-party services.

## Styling & Assets

* **`assets/images/`:** Here's where we store the local images for the frontend UI, including our background wallpapers and the good/bad visual scanning examples utilized in the modal overlay.
* **`styles.css`:** To establish our aesthetic, I wanted to maintain a strong, graphic-novel feel without bloating the load time. I utilized the bold `Bangers` font for headers and built sliding shader panels with heavy drop shadows to give the interface a stylized, physical depth.
* **`.vercel/`:** The standard, auto-generated configuration folder utilized by Vercel for continuous deployment tracking.

---

## The Legacy Architecture (Vercel Serverless Monolith)

Before evolving into its current microservices and computer-vision architecture, this project operated as a completely different monolithic web application: a local comic shop locator and automated release date tracker. All of the original code for this phase is preserved in the `legacy/` directory.

Here is exactly how that legacy application operated:

### Legacy Front-End (`finder.html`, `releases.html`, `comicfinder.js`)
* **The UI:** `finder.html` and `releases.html` served as the primary interface.
* **Geolocation & Hardware APIs:** `comicfinder.js` hooked directly into the browser's `navigator.geolocation` API to pull the user's raw latitude and longitude coordinates. 
* **Touch Interactions:** To navigate the store results, I integrated `Hammer.js` to enable mobile-native swipe gestures. Swiping right on a generated store card triggered a mathematical rotation and translation animation, fading the card out while pushing its metadata into a localized array.
* **Persistent Storage:** Instead of spinning up a cloud database for user preferences, the script serialized the swiped store data into a JSON string and pushed it directly into the browser's `localStorage`, allowing users to maintain a "Saved Shops" list across sessions.

### Legacy Backend (`api/find-stores.js`, `api/get-photos.js`)
To securely hide my Google Cloud API keys, the frontend did not talk to Google directly. Instead, it sent coordinate data to Vercel Serverless Functions (`/api/`) acting as a proxy.

* **Multi-Strategy Routing (`find-stores.js`):** Because Google's Places API v1 does not have a native "comic book store" category type, this serverless script executed an automated fallback loop. It would first hit the `searchText` endpoint. If that failed, it would hit `searchNearby` looking for general `book_store` types, and finally fallback to a generic `comics` text search. It then caught the JSON payload and aggressively filtered the text strings against an array of keywords (`manga`, `graphic`, `hobby`) to prune out irrelevant results before returning the data to the client.
* **Asset Retrieval (`get-photos.js`):** Once a store was identified, this script extracted the specific `photoreference` string, appended the secure API key on the backend, and fetched the raw binary image buffer from Google's media endpoint—caching the image for 24 hours (`max-age=86400`) to minimize outgoing API billing costs.