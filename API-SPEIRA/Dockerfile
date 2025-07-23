FROM node:18-bookworm

WORKDIR /usr/src/app

# Instalación del sistema base
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Instalación de dependencias necesarias para módulos nativos
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    pkg-config \
    libpixman-1-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    libjpeg-dev \
    librsvg2-dev && \
    rm -rf /var/lib/apt/lists/*

# Copiar dependencias primero para usar cache de Docker
COPY package*.json ./
RUN npm install
RUN npm install -g pm2

# Copiar el resto del código, incluyendo reportes y assets
COPY . .

# Exponer el puerto que uses (controlado por variable de entorno .env)
EXPOSE ${PORT}

# Comando de inicio
CMD ["pm2-runtime", "server.js"]
