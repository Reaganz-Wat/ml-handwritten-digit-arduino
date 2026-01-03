#!/bin/bash

echo "Checking what's using /dev/ttyUSB0..."
echo ""

# Find processes using the port
PROCESSES=$(sudo fuser /dev/ttyUSB0 2>/dev/null)

if [ -z "$PROCESSES" ]; then
    echo "No process found using /dev/ttyUSB0"
    echo "Checking permissions..."
    ls -l /dev/ttyUSB0
    echo ""
    echo "Fixing permissions..."
    sudo chmod 666 /dev/ttyUSB0
    echo "Done! Try your prediction again."
else
    echo "Found processes using /dev/ttyUSB0: $PROCESSES"
    echo ""
    echo "Process details:"
    ps -p $PROCESSES -o pid,comm,cmd
    echo ""
    echo "Killing these processes..."
    sudo kill -9 $PROCESSES
    echo "Done! Port should be free now."
fi

echo ""
echo "Current port status:"
ls -l /dev/ttyUSB0
