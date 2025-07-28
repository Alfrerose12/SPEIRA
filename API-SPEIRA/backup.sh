#!/bin/bash

# Configuración
LOG_FILE="/backups/backup.log"
BACKUP_DIR="/backups"

# Función para registrar logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "Iniciando servicio de backups MongoDB"

while true; do
    TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    
    log "Comenzando backup: $BACKUP_PATH"
    
    # Ejecutar mongodump
    if mongodump \
        --host=mongo \
        --port=27017 \
        --db=speiraDB \
        --out="$BACKUP_PATH" 2>> "$LOG_FILE";
    then
        log "Backup exitoso: $BACKUP_PATH"
        
        # Comprimir backup (opcional)
        if tar -czf "$BACKUP_PATH.tar.gz" "$BACKUP_PATH" 2>> "$LOG_FILE"; then
            log "Compresión exitosa: $BACKUP_PATH.tar.gz"
            rm -rf "$BACKUP_PATH"
        else
            log "Error al comprimir: $BACKUP_PATH"
        fi
    else
        log "ERROR en el backup: $BACKUP_PATH"
    fi

    # Limpieza de backups antiguos (>7 días)
    log "Eliminando backups antiguos..."
    find "$BACKUP_DIR" -name "backup_*" \( -type d -o -name "*.tar.gz" \) -mtime +7 -exec rm -rf {} \; 2>> "$LOG_FILE"

    # Espera 24 horas
    log "Esperando 24 horas para el próximo backup..."
    sleep 86400
done