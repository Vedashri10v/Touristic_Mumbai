import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable Cross-Origin requests for React

# Local route tips database
ROUTE_DATABASE = {
    "south mumbai": {
        "bestTransport": "Western / Central Railway train to Churchgate or CST.",
        "bestTime": "4:00 PM - 8:00 PM (Evening Sunset & Breeze)",
        "travelTip": "Taxis are metered and readily available near all major monuments."
    },
    "bandra": {
        "bestTransport": "Western Railway to Bandra Station (West) + Auto-rickshaw.",
        "bestTime": "5:00 PM - 9:00 PM",
        "travelTip": "Bandra Fort and Bandstand are best explored on foot."
    },
    "borivali": {
        "bestTransport": "Western Railway train to Borivali Station (East).",
        "bestTime": "7:00 AM - 11:00 AM (Morning Safari & Nature Walks)",
        "travelTip": "Rent bicycles near the National Park main gate for easy travel."
    }
}

@app.route('/api/route-info', methods=['POST'])
def get_route_info():
    data = request.get_json() or {}
    area = data.get('area', '').strip().lower()
    
    # Retrieve route advisory or fallback tip
    info = ROUTE_DATABASE.get(area, {
        "bestTransport": "Take nearest local train or BEST local bus.",
        "bestTime": "Morning 9:00 AM - 12:00 PM",
        "travelTip": "Hire local auto-rickshaw or taxi to reach exact landmark."
    })
    
    return jsonify({
        "status": "success",
        "area": area.title(),
        "routeInfo": info
    }), 200

if __name__ == '__main__':
    # Dynamic port binding for cloud providers like Render
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 Flask Microservice starting on port {port}")
    app.run(host='0.0.0.0', port=port)