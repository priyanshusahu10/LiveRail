Write-Host "🚆 Starting LiveRail..." -ForegroundColor Cyan

# Check if port 5000 is in use and kill it
$port5000 = netstat -ano | findstr ":5000" | findstr "LISTENING"
if ($port5000) {
    $pid5000 = ($port5000 -split '\s+')[-1]
    Write-Host "Killing existing process on port 5000 (PID: $pid5000)..." -ForegroundColor Yellow
    taskkill /PID $pid5000 /F 2>$null
    Start-Sleep -Seconds 1
}

$port5173 = netstat -ano | findstr ":5173" | findstr "LISTENING"
if ($port5173) {
    $pid5173 = ($port5173 -split '\s+')[-1]
    Write-Host "Killing existing process on port 5173 (PID: $pid5173)..." -ForegroundColor Yellow
    taskkill /PID $pid5173 /F 2>$null
    Start-Sleep -Seconds 1
}

# Start Backend Server in new window
Write-Host "Starting backend server on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Priyanshu Sahu\Desktop\Railway\server'; node index.js" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Vite dev server in new window
Write-Host "Starting Vite frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Priyanshu Sahu\Desktop\Railway\client'; npx vite" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " LiveRail is starting up!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host " Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
