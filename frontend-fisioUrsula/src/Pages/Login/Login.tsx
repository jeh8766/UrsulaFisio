import { type FormEvent, useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [mensagem, setMensagem] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    if (!email.trim() || !senha) {
      setMensagem("Preencha seu e-mail e sua senha para continuar.");
      return;
    }
    setMensagem("Interface pronta para ser conectada ao serviço de autenticação.");
  }

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Apresentação do sistema">
        <div className="visual-top">
          <div className="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 7v34M7 24h34M12 12c7-5 17-5 24 0M12 36c7 5 17 5 24 0" /></svg></div>
          <span className="brand-name">Vitta<span>Fisio</span></span>
        </div>
        <div className="visual-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> CUIDADO EM CADA DETALHE</span>
          <h1>Seu cuidado.<br />Sua rotina.<br /><em>Em harmonia.</em></h1>
          <p>Um espaço feito para simplificar sua rotina e deixar você mais perto do que realmente importa: o cuidado com cada paciente.</p>
          <div className="visual-points">
            <div className="visual-point"><span className="point-icon">✓</span><span>Pacientes e prontuários em um só lugar</span></div>
            <div className="visual-point"><span className="point-icon">✓</span><span>Agenda organizada, sem complicação</span></div>
            <div className="visual-point"><span className="point-icon">✓</span><span>Acompanhamento clínico e financeiro</span></div>
          </div>
        </div>
        <div className="visual-bottom">
          <div className="quote-mark">“</div>
          <p>Mais organização para você. Mais atenção para quem confia em você.</p>
          <span className="quote-line" />
          <small>GESTÃO DE ATENDIMENTO FISIOTERAPÊUTICO</small>
        </div>
        <div className="decor decor-one" /><div className="decor decor-two" />
      </section>

      <section className="login-panel">
        <div className="mobile-brand">
          <div className="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 7v34M7 24h34M12 12c7-5 17-5 24 0M12 36c7 5 17 5 24 0" /></svg></div>
          <span className="brand-name">Vitta<span>Fisio</span></span>
        </div>
        <div className="login-content">
          <div className="welcome-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg></div>
          <p className="form-kicker">ÁREA PROFISSIONAL</p>
          <h2>Que bom ter você<br />por aqui.</h2>
          <p className="form-description">Entre na sua conta para acessar seu espaço de cuidado.</p>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">E-mail profissional</label>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
              <input id="email" type="email" autoComplete="username" placeholder="voce@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="label-row">
              <label htmlFor="senha">Senha</label>
              <button className="text-button" type="button" onClick={() => setMensagem("Conecte este botão ao fluxo de recuperação de senha do sistema.")}>Esqueceu a senha?</button>
            </div>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
              <input id="senha" type={mostrarSenha ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" value={senha} onChange={e => setSenha(e.target.value)} />
              <button className="show-password" type="button" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>
                {mostrarSenha ? "Ocultar" : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="3" /></svg>}
              </button>
            </div>
            <label className="remember-row">
              <input type="checkbox" checked={lembrar} onChange={e => setLembrar(e.target.checked)} />
              <span className="custom-check" /><span>Manter conectado neste dispositivo</span>
            </label>
            {mensagem && <p className="form-message" role="status">{mensagem}</p>}
            <button className="submit-button" type="submit">Entrar na minha conta <span aria-hidden="true">→</span></button>
          </form>
          <div className="secure-note"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg><span>Ambiente profissional com foco em privacidade</span></div>
        </div>
        <footer className="panel-footer"><span>© 2026 VittaFisio</span><span>Feito para cuidar de quem cuida.</span></footer>
      </section>
    </main>
  );
}
