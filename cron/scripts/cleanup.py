from os import listdir, remove, getenv
from os.path import isfile, join
import datetime
import re
import glob

print("Cleanup")

# Load configurations from environment variables with defaults
CUTOFF_DAYS = int(getenv('BACKUP_DAYS', 3))  # Default to 3 days
KEEP_AT_LEAST = int(getenv('BACKUP_KEEP_AT_LEAST', 5))  # Default to keeping 5 files
DB = str(getenv('POSTGREST_DB', 'noname'))  # Default to noname

localpath = '/backups/'

# Get current date and cutoff date
now = datetime.datetime.now()
cutoff_date = now - datetime.timedelta(days=CUTOFF_DAYS)

# Regular expression pattern to match the date in the filenames
pattern = re.compile(f'{DB}' + r'-(\d{4}-\d{2}-\d{2})-\d{6}\.sql')

# Extract dates and sort
files = [f for f in listdir(localpath) if isfile(join(localpath, f))]
dates = []

for filename in files:
    match = pattern.match(filename)
    if match:
        date_str = match.group(1)
        date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        dates.append((date_obj, filename))

# Sort by date
dates.sort()

# Filter files older than the cutoff date and not in the last KEEP_AT_LEAST files
old_files = [f[1] for f in dates if f[0] < cutoff_date]
if len(dates) > KEEP_AT_LEAST:
    old_files = old_files[:-KEEP_AT_LEAST]

# Remove old files
for old_file in old_files:
    file_paths = glob.glob(join(localpath, old_file))
    for file_path in file_paths:
        try:
            remove(file_path)
            print(f"Deleted {file_path}")
        except Exception as e:
            print(f"Failed to delete {file_path}: {e}")

print("Cleanup complete.")
