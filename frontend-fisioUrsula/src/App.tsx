import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./Pages/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Agenda from "./Pages/Agenda/Agenda";
import Financeiro from "./Pages/Financeiro/Financeiro";
import ModuleLayout from "./Pages/ModuleLayout/ModuleLayout";
import Prontuario from "./Pages/Prontuario/Prontuario";
import CadastroPaciente from "./Pages/Paciente/CadastroPaciente";
import Paciente from "./Pages/Paciente/Paciente";
import "./App.css";





function NotFound() {
  return <main className="not-found"><span>404</span><h1>Página não encontrada</h1><p>Esse endereço não existe no VittaFisio.</p><a href="/dashboard">Ir para a página inicial</a></main>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/prontuarios" element={<Prontuario />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/paciente" element={<Paciente />} />
        <Route path="/cadastro-paciente" element={<CadastroPaciente />} />
        <Route path="/modulo/:modulo" element={<ModuleLayout title="Módulo" subtitle="Área de trabalho do módulo selecionado." eyebrow="MÓDULO EM DESENVOLVIMENTO"><p>Conteúdo do módulo em desenvolvimento.</p></ModuleLayout>} />
        
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}


