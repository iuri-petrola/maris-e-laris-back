
# Criar tabela produtos e dar carga inicial
npm run prisma:migrate -- --name init_produtos
npm run prisma:seed


# cadastrar produto
curl --request POST \
  --url http://localhost:8085/api/produtos \
  --header 'Content-Type: multipart/form-data' \
  --form 'nome=produto 2' \
  --form image=@/home/iuri/Vídeos/1.jpg



# Criar novo usuario
npm run admin:create


# Atualizar senha do usuario admin
npm run admin:password