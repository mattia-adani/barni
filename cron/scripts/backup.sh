BACKUP_DIR="/backups"; 
BACKUP_FILE="$BACKUP_DIR/$POSTGRES_DB-$(date +%Y-%m-%d-%H%M%S).sql";
mkdir -p "$BACKUP_DIR";
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > "$BACKUP_FILE";
echo "Backup completed at $(date) to $BACKUP_FILE"