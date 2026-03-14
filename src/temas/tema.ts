export type NomeTema = "claro" | "escuro";

export type CoresTema = {
  fundo: string;
  fundoSecundario: string;
  fundoCard: string;
  borda: string;
  texto: string;
  textoSecundario: string;
  textoSuave: string;
  primaria: string;
  perigo: string;
};

export const TEMAS: Record<NomeTema, CoresTema> = {
  claro: {
    fundo: "#f8fafc",
    fundoSecundario: "#ffffff",
    fundoCard: "#ffffff",
    borda: "#cbd5e1",
    texto: "#0f172a",
    textoSecundario: "#334155",
    textoSuave: "#64748b",
    primaria: "#06b6d4",
    perigo: "#ef4444",
  },
  escuro: {
    fundo: "#020617",
    fundoSecundario: "#0f172a",
    fundoCard: "#0f172a",
    borda: "#1e293b",
    texto: "#ffffff",
    textoSecundario: "#cbd5e1",
    textoSuave: "#94a3b8",
    primaria: "#06b6d4",
    perigo: "#ef4444",
  },
};