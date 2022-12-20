#!bin/bash

echo "Pulling latest changes from the remote..."
git pull

echo "Restarting bot process..."
pm2 restart modrunner-bot

echo "Bot has been updated."
