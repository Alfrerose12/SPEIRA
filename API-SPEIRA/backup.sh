#!/bin/bash

while true; do
    TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
    BACKUP_DIR="/backups/backup_$TIMESTAMP"
    
    # 1. Ejecutar mongodump con autenticación (usa variables de entorno)
    mongodump \
        --uri="${MONGO_URI}" \
        --out="$BACKUP_DIR" \
        --quiet  # Modo silencioso para logs limpios

    # 2. Comprimir el backup para ahorrar espacio (opcional)
    tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR" && rm -rf "$BACKUP_DIR"

    # 3. Limpieza: eliminar backups antiguos (>7 días)
    find /backups -name "backup_*.tar.gz" -mtime +7 -delete

    # 4. Registrar en logs (útil para debugging)
    echo "[$(date)] Backup completado: $BACKUP_DIR.tar.gz" >> /backups/backup.log

    # 5. Esperar 24 horas antes del próximo backup
    sleep 86400
done