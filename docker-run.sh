# docker build e push image
   docker build -t iuripetrola/mariselaris-backnodejs:latest . --push

  
# Limpar container e imagem antiga

   docker container rm -f mariselaris-backnodejs && docker image rmi iuripetrola/mariselaris-backnodejs:latest


# Iniciar container App
   docker run -itd --name mariselaris-backnodejs -h mariselaris-backnodejs --net net_someu --restart unless-stopped  -p 8082:8080 --env DATABASE_URL="postgresql://user_nodejs_maris_laris:pass_nodejs_maris_laris@69.197.134.140:5432/db_nodejs_maris_laris?schema=public" --env UPLOADS_DIR="/mnt/files-maris-laris" --env UPLOADS_PUBLIC_PATH="/files" --env JWT_SECRET=fbc878419638a610508320c876597c83 --mount type=bind,source=/mnt/files-maris-laris,target=/mnt/files-maris-laris iuripetrola/mariselaris-backnodejs:latest
