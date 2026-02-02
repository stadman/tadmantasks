#!/bin/bash
# Stop TadmanTasks

if [ ! -f /tmp/tadmantasks.pid ]; then
  echo "TadmanTasks not running (no PID file)"
  exit 0
fi

PID=$(cat /tmp/tadmantasks.pid)

if ps -p $PID > /dev/null 2>&1; then
  kill $PID
  rm /tmp/tadmantasks.pid
  echo "✅ TadmanTasks stopped (PID $PID)"
else
  echo "TadmanTasks not running (stale PID file)"
  rm /tmp/tadmantasks.pid
fi
