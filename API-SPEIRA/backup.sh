while true; do
  TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
  mongodump --host mongo --port 27017 --out /backups/backup_$TIMESTAMP
  find /backups -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;
  sleep 86400
done
