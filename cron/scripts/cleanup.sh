#BACKUP_DIR="/backups";
#find "$BACKUP_DIR" -type f -mtime +$BACKUP_PERSISTENCE_DAYS -name "$POSTGRES_DB-*-*-*.sql" -exec rm {} \;
#echo "Removed backups older than $BACKUP_PERSISTENCE_DAYS days";
python3 /scripts/cleanup.py