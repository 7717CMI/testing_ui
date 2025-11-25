#!/bin/bash

echo "Starting Healthcare Data Catalog..."
echo

echo "Starting Backend Server..."
cd backend
python run.py &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend Server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3001"
echo "Data Catalog: http://localhost:3001/data-catalog"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait





















