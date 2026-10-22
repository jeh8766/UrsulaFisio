
import "./Login.css";

const BACKEND_URL = "http://localhost:8080";

export default function Login() {
  function entrarComGoogle() {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  }

  return (
    <main className="login-page">
      <section
        className="login-visual"
        aria-label="Apresentação do sistema"
      >
        <div className="visual-top">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M24 7v34M7 24h34M12 12c7-5 17-5 24 0M12 36c7 5 17 5 24 0" />
            </svg>
          </div>
          <span className="brand-name">
            Vitta<span>Fisio</span>
          </span>
        </div>

        <div className="visual-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            CUIDADO EM CADA DETALHE
          </span>

          <h1>
            Seu cuidado.
            <br />
            Sua rotina.
            <br />
            <em>Em harmonia.</em>
          </h1>

          <p>
            Um espaço feito para simplificar sua rotina e deixar
            você mais perto do que realmente importa: o cuidado
            com cada paciente.
          </p>

          <div className="visual-points">
            <div className="visual-point">
              <span className="point-icon">✓</span>
              <span>Pacientes e prontuários em um só lugar</span>
            </div>

            <div className="visual-point">
              <span className="point-icon">✓</span>
              <span>Agenda organizada, sem complicação</span>
            </div>

            <div className="visual-point">
              <span className="point-icon">✓</span>
              <span>Acompanhamento clínico e financeiro</span>
            </div>
          </div>
        </div>

        <div className="visual-bottom">
          <div className="quote-mark">“</div>
          <p>
            Mais organização para você. Mais atenção para quem
            confia em você.
          </p>
          <span className="quote-line" />
          <small>GESTÃO DE ATENDIMENTO FISIOTERAPÊUTICO</small>
        </div>

        <div className="decor decor-one" />
        <div className="decor decor-two" />
      </section>

      <section className="login-panel">
        <div className="mobile-brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M24 7v34M7 24h34M12 12c7-5 17-5 24 0M12 36c7 5 17 5 24 0" />
            </svg>
          </div>
          <span className="brand-name">
            Vitta<span>Fisio</span>
          </span>
        </div>

        <div className="login-content">
          <div className="welcome-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
            </svg>
          </div>

          <p className="form-kicker">ÁREA PROFISSIONAL</p>

          <h2>
            Que bom ter você
            <br />
            por aqui.
          </h2>

          <p className="form-description">
            Entre com sua conta Google autorizada para acessar
            seu espaço de cuidado.
          </p>

          <button
            className="google-login-button"
            type="button"
            onClick={entrarComGoogle}
          >
            <svg
              className="google-icon"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
              />
              <path
                fill="#FBBC05"
                d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
              />
              <path
                fill="#EA4335"
                d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
              />
            </svg>

            <span>Continuar com Google</span>
            <span className="google-button-arrow" aria-hidden="true">
              →
            </span>
          </button>

          <p className="login-access-note">
            O acesso é permitido somente às contas autorizadas
            pela administração do sistema.
          </p>

          <div className="secure-note">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <span>Ambiente profissional com foco em privacidade</span>
          </div>
        </div>

        <footer className="panel-footer">
          <span>© 2026 VittaFisio</span>
          <span>Feito para cuidar de quem cuida.</span>
        </footer>
      </section>
    </main>
  );
}
