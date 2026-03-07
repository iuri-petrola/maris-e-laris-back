export type ProdutoItem = {
  id: number;
  nome: string;
  imagemUrl: string;
};

export function getProdutos(): ProdutoItem[] {
  return [
    {
      id: 1,
      nome: 'Colecao destaque',
      imagemUrl: '/assets/maris-e-laris-banner-principal.png'
    }
  ];
}
