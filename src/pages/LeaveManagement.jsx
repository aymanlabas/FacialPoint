import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Filter, MessageSquare } from 'lucide-react';
import LeaveService from '../services/LeaveService';
import './LeaveManagement.css';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [actionType, setActionType] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, leaves]);

  const fetchAllLeaves = async () => {
    setLoading(true);
    try {
      const allLeaves = await LeaveService.getAllLeaveRequests();
      setLeaves(allLeaves);
    } catch (err) {
      setError('Erreur lors du chargement des demandes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredLeaves(leaves);
    } else {
      setFilteredLeaves(leaves.filter(leave => leave.status === filter));
    }
  };

  const handleOpenDetail = (leave) => {
    setSelectedLeave(leave);
    setAdminComment('');
    setActionType(null);
    setIsDetailModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedLeave) return;
    setLoading(true);
    try {
      await LeaveService.approveLeave(selectedLeave.id, adminComment);
      setSuccess('Congé approuvé avec succès');
      setIsDetailModalOpen(false);
      fetchAllLeaves();
    } catch (err) {
      setError('Erreur lors de l\'approbation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave) return;
    setLoading(true);
    try {
      await LeaveService.rejectLeave(selectedLeave.id, adminComment);
      setSuccess('Congé refusé');
      setIsDetailModalOpen(false);
      fetchAllLeaves();
    } catch (err) {
      setError('Erreur lors du refus');
      console.error(err);
    } finally {
      setLoading(false);
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

  const getLeaveTypeColor = (type) => {
    switch(type) {
      case 'annual':
        return 'blue';
      case 'sick':
        return 'red';
      case 'exceptional':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <div className="leave-management-container">
      <div className="leave-management-header">
        <h1>Gestion des Congés</h1>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <Clock size={18} /> En attente
        </button>
        <button
          className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          <CheckCircle size={18} /> Approuvés
        </button>
        <button
          className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          <XCircle size={18} /> Refusés
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <Filter size={18} /> Tous
        </button>
      </div>

      {/* Leaves Table */}
      <div className="leaves-table-container">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="no-data">Aucune demande de congé</div>
        ) : (
          <table className="leaves-table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Du</th>
                <th>Au</th>
                <th>Jours</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map(leave => (
                <tr key={leave.id}>
                  <td>
                    <div className="employee-info">
                      <div className="employee-name">{leave.employeeName}</div>
                      <div className="employee-email">{leave.employeeEmail}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`leave-type-badge ${getLeaveTypeColor(leave.leaveType)}`}>
                      {getLeaveTypeLabel(leave.leaveType)}
                    </span>
                  </td>
                  <td>{new Date(leave.startDate).toLocaleDateString('fr-FR')}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString('fr-FR')}</td>
                  <td className="days-cell">{leave.days}j</td>
                  <td>
                    <div className="reason-cell" title={leave.reason}>
                      {leave.reason ? leave.reason.substring(0, 50) + '...' : '-'}
                    </div>
                  </td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>
                    <button
                      className="btn btn-small btn-info"
                      onClick={() => handleOpenDetail(leave)}
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedLeave && (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de la demande de congé</h2>
              <button className="close-btn" onClick={() => setIsDetailModalOpen(false)}>×</button>
            </div>

            <div className="detail-content">
              {/* Employee Info */}
              <div className="detail-section">
                <h3>Informations de l'employé</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Nom:</span>
                    <span className="value">{selectedLeave.employeeName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedLeave.employeeEmail}</span>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="detail-section">
                <h3>Détails du congé</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Type:</span>
                    <span className={`leave-type-badge ${getLeaveTypeColor(selectedLeave.leaveType)}`}>
                      {getLeaveTypeLabel(selectedLeave.leaveType)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Statut:</span>
                    {getStatusBadge(selectedLeave.status)}
                  </div>
                  <div className="detail-item">
                    <span className="label">Date de début:</span>
                    <span className="value">{new Date(selectedLeave.startDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date de fin:</span>
                    <span className="value">{new Date(selectedLeave.endDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Nombre de jours:</span>
                    <span className="value">{selectedLeave.days} jour(s)</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {selectedLeave.reason && (
                <div className="detail-section">
                  <h3>Motif</h3>
                  <div className="reason-text">{selectedLeave.reason}</div>
                </div>
              )}

              {/* Admin Comment */}
              {selectedLeave.adminComment && (
                <div className="detail-section">
                  <h3>Commentaire administrateur</h3>
                  <div className={`admin-comment-text ${selectedLeave.status}`}>
                    {selectedLeave.adminComment}
                  </div>
                </div>
              )}

              {/* Admin Response Section */}
              {selectedLeave.status === 'pending' && (
                <div className="detail-section">
                  <h3>
                    <MessageSquare size={18} /> Ajouter un commentaire
                  </h3>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Ajouter un commentaire (optionnel)..."
                    rows="4"
                    className="comment-textarea"
                  />
                </div>
              )}

              {/* Dates Info */}
              <div className="detail-section detail-dates">
                <div className="date-info">
                  <span className="label">Demande créée:</span>
                  <span className="value">{new Date(selectedLeave.createdAt).toLocaleDateString('fr-FR', { 
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                {selectedLeave.approvedAt && (
                  <div className="date-info">
                    <span className="label">Approuvée:</span>
                    <span className="value">{new Date(selectedLeave.approvedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                {selectedLeave.rejectedAt && (
                  <div className="date-info">
                    <span className="label">Refusée:</span>
                    <span className="value">{new Date(selectedLeave.rejectedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions">
              {selectedLeave.status === 'pending' && (
                <>
                  <button
                    className="btn btn-danger"
                    onClick={handleReject}
                    disabled={loading}
                  >
                    <XCircle size={18} /> Refuser
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    <CheckCircle size={18} /> Approuver
                  </button>
                </>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
