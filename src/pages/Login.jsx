import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ScanFace, Mail, Lock } from 'lucide-react';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            // Wait a bit for auth context to update and redirect
            navigate('/punch');
        } catch (err) {
            setError('Échec de la connexion. Vérifiez vos identifiants.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <div className="logo-container">
                        <ScanFace className="text-accent" size={48} />
                    </div>
                    <h2>Bienvenue sur <span className="text-gradient">FacialPoint</span></h2>
                    <p className="text-muted">Connectez-vous pour accéder à votre espace</p>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                className="input-field with-icon"
                                placeholder="Ex: user@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Mot de passe</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                className="input-field with-icon"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="btn btn-primary w-full mt-4">
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="text-sm text-muted">Mots de passe de test (Sans config Firebase) :</p>
                    <div className="mock-creds">
                        <span className="badge-admin">admin@admin.com</span>
                        <span className="badge-emp">user@user.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
