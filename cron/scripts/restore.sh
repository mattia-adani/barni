#!bin/sh
echo "Syncing remote backup folder with local restore folder"
rclone sync onedrive:$REMOTE_BACKUP_FOLDER /restore

echo "Terminating connections ..."

psql -h db -U $DB_USER -d $DB_DATABASE -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_DATABASE' AND pid <> pg_backend_pid()";

echo "Dropping database ..."
dropdb -h db -U $DB_USER $DB_DATABASE

echo "Creating database ..."
createdb -h db -U $DB_USER $DB_DATABASE

echo "Restoring database ..."
psql -U $DB_USER -h db -f "/restore/$DB_DATABASE-latest.sql"
