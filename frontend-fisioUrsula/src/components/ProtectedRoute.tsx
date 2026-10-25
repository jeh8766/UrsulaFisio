import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const BACKEND_URL = "http://localhost:8080";

type EstadoAutenticacao = "carregando" | "autenticada" | "naoAutenticada";

export default function ProtectedRoute() {
  const [estado, setEstado] = useState<EstadoAutenticacao>("carregando");

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      try {
        const resposta = await fetch(`${BACKEND_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!resposta.ok) {
          if (ativo) setEstado("naoAutenticada");
          return;
        }

        const dados = await resposta.json();

        if (ativo) {
          setEstado(
            dados.autenticado === true ? "autenticada" : "naoAutenticada",
          );
        }
      } catch (erro) {
        console.error("Erro ao verificar a sessão:", erro);
        if (ativo) setEstado("naoAutenticada");
      }
    }

    verificarSessao();
    return () => {
      ativo = false;
    };
  }, []);

  if (estado === "carregando") {
    return <p>Verificando sua sessão...</p>;
  }

  if (estado === "naoAutenticada") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
