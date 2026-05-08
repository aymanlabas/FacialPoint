import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, User, Mail, Shield, Briefcase } from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const { currentUser, userProfile, userRole } = useAuth();
    const qrRef = useRef(null);

    if (!currentUser) return <div className="p-8 text-center">Chargement...</div>;

    const downloadQRCode = () => {
        const canvas = qrRef.current.querySelector('canvas');
        const image = canvas.toDataURL("image/png");
        const anchor = document.createElement("a");
        anchor.href = image;
        anchor.download = `QR_Code_${userProfile?.firstName || 'User'}.png`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    // The QR code contains the UID which is used as the employee ID in this system
    const qrValue = currentUser.uid;

    return (
        <div className="profile-container animate-fade-in">
            <div className="profile-header">
                <h1>Mon Profil</h1>
                <p className="text-muted">Gérez vos informations et votre badge numérique</p>
            </div>

            <div className="profile-grid">
                <div className="info-card glass-panel">
                    <div className="user-avatar-large">
                        <User size={64} />
                    </div>
                    <h2 className="mt-4">{userProfile?.firstName} {userProfile?.lastName}</h2>
                    <span className={`badge ${userRole === 'admin' ? 'badge-admin' : 'badge-emp'} mb-6`}>
                        {userRole === 'admin' ? 'Administrateur' : 'Employé'}
                    </span>

                    <div className="info-list">
                        <div className="info-item">
                            <Mail size={18} className="text-primary-light" />
                            <div>
                                <p className="label">Email</p>
                                <p className="value">{currentUser.email}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <Briefcase size={18} className="text-primary-light" />
                            <div>
                                <p className="label">Département</p>
                                <p className="value">{userProfile?.department || 'Non spécifié'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <Shield size={18} className="text-primary-light" />
                            <div>
                                <p className="label">ID Employé</p>
                                <p className="value text-xs">{currentUser.uid}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="qr-card glass-panel">
                    <h3>Votre QR Code de Pointage</h3>
                    <p className="text-muted text-sm mb-6">
                        Utilisez ce code sur la borne de pointage pour enregistrer votre présence.
                    </p>

                    <div className="qr-wrapper" ref={qrRef}>
                        <QRCodeCanvas
                            value={qrValue}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>

                    <button onClick={downloadQRCode} className="btn btn-primary mt-8 w-full">
                        <Download size={18} /> Télécharger mon QR Code
                    </button>
                    
                    <div className="qr-hint mt-4">
                        <p className="text-xs text-muted text-center">
                            Vous pouvez enregistrer cette image sur votre téléphone pour un accès rapide.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
