cd ~/projects/ecom
pnpm --filter @dtc/backend build
scp -r apps/backend/.medusa/server nagarjunags2014@34.122.111.166:~/malnadProduct/apps/backend/.medusa/
scp apps/backend/.env nagarjunags2014@34.122.111.166:~/malnadProduct/apps/backend/.env
scp apps/backend/.env nagarjunags2014@34.122.111.166:~/malnadProduct/apps/backend/.medusa/server/.env

scp -r apps/backend/ nagarjunags2014@34.122.111.166:~/mphal/



On your Mac

From your backend:

cd ~/projects/ecom/apps/backend
1. Build the Docker image for GCP
docker build --platform linux/amd64 -t medusa-backend:latest .
2. Create a deployment folder
mkdir -p ~/medusa-gcp
3. Export the Docker image into that folder
docker save medusa-backend:latest | gzip > ~/medusa-gcp/medusa-backend.tar.gz
4. Copy your production environment file
cp .env.production ~/medusa-gcp/.env
5. Check the folder
ls -lh ~/medusa-gcp

You should have:

medusa-gcp/
├── medusa-backend.tar.gz
└── .env

That's the entire folder you need to upload to GCP.

On GCP

After uploading the medusa-gcp folder:

cd ~/medusa-gcp

Load the Docker image:

gunzip medusa-backend.tar.gz
sudo docker load < medusa-backend.tar

Check:

sudo docker images

You should see:

medusa-backend   latest
Start Medusa
sudo docker run -d \
  --name medusa \
  --restart unless-stopped \
  --env-file .env \
  -p 9000:9000 \
  medusa-backend:latest

Check:

sudo docker ps

Logs:

sudo docker logs -f medusa
So your final folder is simply:
medusa-gcp/
├── medusa-backend.tar.gz    ← Docker image
└── .env                     ← production environment

No build or npm/pnpm install is required on GCP. The Docker image already contains Node, dependencies, and the built Medusa application.