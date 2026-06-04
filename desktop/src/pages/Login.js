export function LoginPage({ onLogin, error }) {
    return `
        <div class="page" id="login-page">
            <div class="auth-container">
                <div class="auth-box">
                    <div class="auth-logo">
                        <div class="logo-icon">🎬</div>
                        <h1>ReelFlow</h1>
                        <p>Videolaringiz oqimi</p>
                    </div>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <input type="email" id="email" placeholder="Email" class="auth-input" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="password" placeholder="Parol" class="auth-input" required>
                        </div>
                        ${error ? `<div class="error-message">${error}</div>` : ''}
                        <button type="submit" class="auth-btn">Kirish</button>
                    </form>
                    
                    <div class="auth-footer">
                        <span>Hisobingiz yo'qmi?</span>
                        <a href="#" id="register-link">Ro'yxatdan o'tish</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}
