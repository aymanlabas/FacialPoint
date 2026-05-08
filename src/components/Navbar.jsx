import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ScanFace, LayoutDashboard, Users, QrCode, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const { currentUser, userRole, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    }

    if (!currentUser) return null;

    return (
        <nav className="navbar glass-panel">
            <div className="navbar-logo">
                <ScanFace className="text-accent" size={28} />
                <span className="text-gradient">FacialPoint</span>
            </div>

            <div className="navbar-links">
                {userRole === 'admin' && (
                    <>
                        <Link to="/dashboard" className="nav-item">
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                        <Link to="/employees" className="nav-item">
                            <Users size={18} /> Employés
                        </Link>
                    </>
                )}
                <Link to="/punch" className="nav-item">
                    <ScanFace size={18} /> Pointage
                </Link>
                <Link to="/scanner" className="nav-item">
                    <QrCode size={18} /> Scanner QR
                </Link>
                <Link to="/profile" className="nav-item">
                    <User size={18} /> Mon QR
                </Link>
            </div>

            <div className="navbar-user">
                <div className="user-info">
                    <span className="user-email">{currentUser.email}</span>
                    <span className={`user-badge ${userRole === 'admin' ? 'badge-admin' : 'badge-emp'}`}>
                        {userRole === 'admin' ? 'Admin' : 'Employé'}
                    </span>
                </div>
                <button onClick={handleLogout} className="btn-icon" title="Se déconnecter">
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
}
