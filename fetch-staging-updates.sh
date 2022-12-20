#!bin/bash

echo "Pulling latest changes from the remote..."
git pull

echo "Restarting bot process..."
pm2 restart modrunner-staging

echo "Bot has been updated."
