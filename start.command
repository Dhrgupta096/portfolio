#!/bin/bash
cd "$(dirname "$0")"
echo "=========================================================================="
echo " Starting DSU Aerospace Blueprint Portfolio Server on http://localhost:8085"
echo "=========================================================================="
python3 -m http.server 8085
