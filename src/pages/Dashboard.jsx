import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import FirebaseService from '../services/FirebaseService';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        late: 0,
        absent: 0
    });

    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Récupérer tous les employés
                const users = await FirebaseService.getData('users');
                const employeesList = users.filter(u => u.role !== 'admin'); // Optionnel: exclure les admins des stats
                const totalEmployees = users.length;

                // 2. Récupérer l'historique de pointage
                const attendances = await FirebaseService.getData('attendance');

                // Trier les pointages du plus récent au plus ancien
                attendances.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setRecentLogs(attendances.slice(0, 10)); // Prendre les 10 derniers

                // 3. Calculer les statistiques du jour
                const todayStr = new Date().toLocaleDateString('fr-CA'); // format: YYYY-MM-DD

                // Filtrer les entrées ('check-in') d'aujourd'hui
                const checkInsToday = attendances.filter(
                    log => log.date === todayStr && log.type === 'check-in'
                );

                // Récupérer les ID uniques des personnes présentes aujourd'hui
                const presentUserIds = new Set(checkInsToday.map(log => log.userId));
                const presentCount = presentUserIds.size;

                // Calculer les retards (entrée après 09:00 par défaut)
                let lateCount = 0;
                checkInsToday.forEach(log => {
                    // simple check basé sur la chaîne de caractères (ex: "09:15:00" > "09:00:00")
                    if (log.time > "09:00:00") {
                        lateCount++;
                    }
                });

                const absentCount = Math.max(0, totalEmployees - presentCount);

                setStats({
                    total: totalEmployees,
                    present: presentCount,
                    late: lateCount,
                    absent: absentCount
                });

            } catch (error) {
                console.error("Erreur de récupération des données Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Détermine le statut pour l'affichage dans le tableau
    const getDisplayStatus = (log) => {
        if (log.type === 'check-in') {
            return log.time > "09:00:00" ? 'late' : 'present';
        }
        return 'present'; // on peut considérer un check-out comme normal
    };

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header mb-6">
                <h1>Tableau de Bord</h1>
                <p className="text-muted">Aperçu en temps réel de la présence d'aujourd'hui</p>
            </div>

            <div className="stats-grid mb-8">
                <div className="stat-card glass-panel">
                    <div className="stat-icon-wrapper blue">
                        <Users size={24} className="stat-icon" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{loading ? '-' : stats.total}</span>
                        <span className="stat-label">Total Employés</span>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon-wrapper green">
                        <CheckCircle2 size={24} className="stat-icon" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{loading ? '-' : stats.present}</span>
                        <span className="stat-label">Présents Aujourd'hui</span>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon-wrapper warning">
                        <Clock size={24} className="stat-icon" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{loading ? '-' : stats.late}</span>
                        <span className="stat-label">En retard (&gt; 09h00)</span>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon-wrapper danger">
                        <AlertTriangle size={24} className="stat-icon" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{loading ? '-' : stats.absent}</span>
                        <span className="stat-label">Absents</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="content-card glass-panel flex-1">
                    <div className="card-header pb-4">
                        <h2>Derniers Pointages</h2>
                    </div>
                    <div className="table-responsive mt-4">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employé</th>
                                    <th>Date</th>
                                    <th>Heure</th>
                                    <th>Type</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-8 text-muted">
                                            Chargement des données...
                                        </td>
                                    </tr>
                                ) : recentLogs.length > 0 ? (
                                    recentLogs.map(log => {
                                        const status = getDisplayStatus(log);
                                        return (
                                            <tr key={log.id}>
                                                <td className="font-medium text-primary-light">{log.userName || log.userId}</td>
                                                <td className="text-muted">{log.date}</td>
                                                <td className="font-medium">{log.time}</td>
                                                <td>
                                                    <span className={`badge ${log.type === 'check-in' ? 'badge-primary' : 'badge-secondary'}`}>
                                                        {log.type === 'check-in' ? 'Entrée' : 'Sortie'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="status-indicator">
                                                        <span className={`status-dot ${status === 'present' ? 'success' : 'warning'}`}></span>
                                                        <span className="capitalize">{status === 'present' ? "À l'heure" : 'Retard'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-8 text-muted">
                                            Aucun pointage enregistré pour le moment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
