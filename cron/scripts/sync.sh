sleep 15; 
echo "rclone sync /backups onedrive:$REMOTE_BACKUP_FOLDER";
rclone sync /backups onedrive:$REMOTE_BACKUP_FOLDER;
