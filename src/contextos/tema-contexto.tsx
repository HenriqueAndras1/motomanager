import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { buscarTemaSalvo, salvarTema } from "../servicos/tema-storage";
import { NomeTema, TEMAS } from "../temas/tema";

type TemaContextoType = {
  tema: NomeTema;
  cores: (typeof TEMAS)["claro"];
  carregandoTema: boolean;
  definirTema: (novoTema: NomeTema) => Promise<void>;
};

const TemaContexto = createContext<TemaContextoType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function TemaProvider({ children }: Props) {
  const [tema, setTema] = useState<NomeTema>("escuro");
  const [carregandoTema, setCarregandoTema] = useState(true);

  useEffect(() => {
    async function carregarTema(): Promise<void> {
      try {
        const temaSalvo = await buscarTemaSalvo();

        if (temaSalvo) {
          setTema(temaSalvo);
        }
      } finally {
        setCarregandoTema(false);
      }
    }

    void carregarTema();
  }, []);

  async function definirTema(novoTema: NomeTema): Promise<void> {
    setTema(novoTema);
    await salvarTema(novoTema);
  }

  const valor = useMemo(
    () => ({
      tema,
      cores: TEMAS[tema],
      carregandoTema,
      definirTema,
    }),
    [tema, carregandoTema],
  );

  return (
    <TemaContexto.Provider value={valor}>{children}</TemaContexto.Provider>
  );
}

export function useTema() {
  const contexto = useContext(TemaContexto);

  if (!contexto) {
    throw new Error("useTema deve ser usado dentro de TemaProvider");
  }

  return contexto;
}