#!/bin/bash
# Start TadmanTasks in the background

cd "$(dirname "$0")"

if [ -f /tmp/tadmantasks.pid ]; then
  PID=$(cat /tmp/tadmantasks.pid)
  if ps -p $PID > /dev/null 2>&1; then
    echo "TadmanTasks already running on http://localhost:3001 (PID $PID)"
    exit 0
  fi
fi

npm run dev > /tmp/tadmantasks.log 2>&1 &
echo $! > /tmp/tadmantasks.pid

sleep 2

if ps -p $(cat /tmp/tadmantasks.pid) > /dev/null 2>&1; then
  echo "✅ TadmanTasks started on http://localhost:3001"
  echo "   PID: $(cat /tmp/tadmantasks.pid)"
  echo "   Logs: tail -f /tmp/tadmantasks.log"
else
  echo "❌ Failed to start. Check /tmp/tadmantasks.log"
  exit 1
fi
