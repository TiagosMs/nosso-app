#!/bin/bash
echo "Starting Nosso App at http://localhost:8000"
echo "Press Ctrl+C to stop."
python3 -m http.server 8000 --bind 127.0.0.1
