export type Manutencao = {
  id: string;
  motoId: string;
  tipo: string;
  data: string;
  quilometragem: number;
  custo?: number;
  observacao?: string;
  criadoEm: string;
  atualizadoEm: string;
};