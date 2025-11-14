#!/bin/bash

echo "=== HealthPWA API Tests ==="

echo "1. AI Search - Headache"
curl -X GET "http://localhost:3000/api/search/caregivers?query=I%20have%20a%20headache&lat=28.5672&lng=77.2100&radius=30" \
  -H "Content-Type: application/json" | jq

echo -e "\n2. AI Search - Chest Pain"
curl -X GET "http://localhost:3000/api/search/caregivers?query=chest%20pain%20emergency&lat=28.5672&lng=77.2100&radius=50" \
  -H "Content-Type: application/json" | jq

echo -e "\n3. Traditional Search - Symptoms"
curl -X GET "http://localhost:3000/api/search/caregivers?symptoms=headache&type=doctor&lat=28.5672&lng=77.2100&radius=30" \
  -H "Content-Type: application/json" | jq

echo -e "\n4. Search Without Location"
curl -X GET "http://localhost:3000/api/search/caregivers?query=diabetes%20checkup" \
  -H "Content-Type: application/json" | jq

echo -e "\n5. Search for Nurses"
curl -X GET "http://localhost:3000/api/search/caregivers?query=wound%20care&type=nurse&lat=28.5672&lng=77.2100&radius=20" \
  -H "Content-Type: application/json" | jq