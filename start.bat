@echo off
echo =======================================
echo          Starting NexTrack
echo =======================================
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo Launching server at http://localhost:5000 ...
start http://localhost:5000
npm run dev
