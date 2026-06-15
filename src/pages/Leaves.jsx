import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LeaveService from '../services/LeaveService';
import './Leaves.css';

export default function Leaves() {
  const { currentUser, userProfile } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [statistics, setStatistics] = useState({
    annual: 0,
    sick: 0,
    exceptional: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, [currentUser]);

  const fetchLeaves = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const employeeLeaves = await LeaveService.getEmployeeLeaves(currentUser.uid);
      setLeaves(employeeLeaves);

      const stats = await LeaveService.getLeaveStatistics(currentUser.uid);
      setStatistics(stats);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.startDate || !formData.endDate) {
      setError('Veuillez sélectionner les dates');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start > end) {
      setError('La date de début doit être avant la date de fin');
      return;
    }

    try {
      const days = LeaveService.calculateDays(formData.startDate, formData.endDate);

      const leaveData = {
        employeeName: userProfile?.name || userProfile?.firstName + ' ' + userProfile?.lastName,
        employeeEmail: currentUser.email,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        days,
      };

      await LeaveService.createLeaveRequest(currentUser.uid, leaveData);
      setSuccess('Demande de congé envoyée avec succès');
      setIsModalOpen(false);
      setFormData({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (err) {
      setError('Erreur lors de l\'envoi de la demande');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="badge badge-approved"><CheckCircle size={16} /> Approuvé</span>;
      case 'rejected':
        return <span className="badge badge-rejected"><XCircle size={16} /> Refusé</span>;
      case 'pending':
        return <span className="badge badge-pending"><Clock size={16} /> En attente</span>;
      default:
        return null;
    }
  };

  const getLeaveTypeLabel = (type) => {
    const types = {
      annual: 'Congé annuel',
      sick: 'Maladie',
      exceptional: 'Exceptionnel',
    };
    return types[type] || type;
  };

  return (
    <div className="leaves-container">
      <div className="leaves-header">
        <h1><Calendar size={28} /> Gestion des Congés</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Demander un congé
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="statistics-grid">
        <div className="stat-card">
          <div className="stat-label">Congés annuels utilisés</div>
          <div className="stat-value">{statistics.annual} j</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Jours de maladie </div>
          <div className="stat-value">{statistics.sick} j</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Congés exceptionnels</div>
          <div className="stat-value">{statistics.exceptional} j</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Demandes en attente</div>
          <div className="stat-value">{statistics.pending}</div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {/* Leaves List */}
      <div className="leaves-section">
        <h2>Mes demandes de congés</h2>
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : leaves.length === 0 ? (
          <div className="no-data">Aucune demande de congé</div>
        ) : (
          <div className="leaves-list">
            {leaves.map(leave => (
              <div key={leave.id} className="leave-card">
                <div className="leave-header">
                  <div className="leave-type">{getLeaveTypeLabel(leave.leaveType)}</div>
                  {getStatusBadge(leave.status)}
                </div>
                <div className="leave-details">
                  <div className="detail-item">
                    <span className="label">Du:</span>
                    <span className="value">{new Date(leave.startDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Au:</span>
                    <span className="value">{new Date(leave.endDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Durée:</span>
                    <span className="value">{leave.days} jour(s)</span>
                  </div>
                </div>
                {leave.reason && (
                  <div className="leave-reason">
                    <strong>Motif:</strong> {leave.reason}
                  </div>
                )}
                {leave.adminComment && (
                  <div className={`admin-comment ${leave.status}`}>
                    <strong>Commentaire admin:</strong> {leave.adminComment}
                  </div>
                )}
                <div className="leave-date">
                  Demande du {new Date(leave.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add Leave */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Demander un congé</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Type de congé</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                >
                  <option value="annual">Congé annuel</option>
                  <option value="sick">Maladie</option>
                  <option value="exceptional">Exceptionnel</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de début</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Motif (optionnel)</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Veuillez donner le motif de votre absence..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Envoyer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
