#!/bin/bash

# Deployment Configuration
REPO_URL="https://github.com/RaInedrop24/Linguista.git"
APP_DIR="/var/www/linguista"
DOMAIN="linguista.rainedrop.co.uk"
PORT=3002

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting deployment for $DOMAIN...${NC}"

# 1. Install Dependencies
echo -e "${GREEN}Updating system and installing dependencies...${NC}"
apt-get update
apt-get install -y git nodejs npm nginx certbot python3-certbot-nginx

# Install PM2 globally
npm install -g pm2

# 2. Setup Directory
if [ -d "$APP_DIR" ]; then
    echo -e "${GREEN}Directory exists, pulling latest changes...${NC}"
    cd $APP_DIR
    git pull
else
    echo -e "${GREEN}Cloning repository...${NC}"
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 3. Environment Setup (Placeholder)
# Note: You need to create .env manually or copy it here
if [ ! -f .env ]; then
    echo "WARNING: .env file missing. Please create it."
fi

# 4. Build Application
echo -e "${GREEN}Installing dependencies and building...${NC}"
npm install
npx prisma generate
# npx prisma migrate deploy # Uncomment if using a real DB, for sqlite ensure dev.db is managed
npm run build

# 5. Start/Restart Application
echo -e "${GREEN}Starting application with PM2...${NC}"
pm2 start npm --name "linguista" -- run start -- -p $PORT
pm2 save
pm2 startup

# 6. Nginx Configuration
echo -e "${GREEN}Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 7. SSL Certificate
echo -e "${GREEN}Setting up SSL with Certbot...${NC}"
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m snookertracker247@gmail.com

echo -e "${GREEN}Deployment Complete!${NC}"

