#!/bin/sh
set -eu
umask 077
password=$(cat /run/secrets/redis_password)
case "$password" in
  ''|*[!a-f0-9]*) echo 'Redis secret must be a generated hex password.' >&2; exit 1 ;;
esac
[ "${#password}" -ge 64 ] || { echo 'Redis secret is too short.' >&2; exit 1; }
# Keep the password out of process arguments, image layers and Compose output.
cat /usr/local/etc/redis/base.conf > /run/redis/redis.conf
printf '\nrequirepass %s\n' "$password" >> /run/redis/redis.conf
chown -R redis:redis /run/redis
exec docker-entrypoint.sh redis-server /run/redis/redis.conf
