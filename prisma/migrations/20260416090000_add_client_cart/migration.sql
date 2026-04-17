CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientUserId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cart_items_clientUserId_produtoId_key" ON "cart_items"("clientUserId", "produtoId");

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "client_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
