import FirebaseService from "./FirebaseService";

const LeaveService = {
  // Créer une demande de congé
  async createLeaveRequest(userId, leaveData) {
    try {
      const leaveRequest = {
        userId,
        employeeName: leaveData.employeeName,
        employeeEmail: leaveData.employeeEmail,
        leaveType: leaveData.leaveType, // 'annual', 'sick', 'exceptional'
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        reason: leaveData.reason,
        days: leaveData.days,
        status: "pending", // 'pending', 'approved', 'rejected'
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await FirebaseService.saveData(
        "leave_requests",
        leaveRequest,
      );
      return result;
    } catch (error) {
      console.error(
        "Erreur lors de la création de la demande de congé:",
        error,
      );
      throw error;
    }
  },

  // Récupérer toutes les demandes de congé d'un employé
  async getEmployeeLeaves(userId) {
    try {
      const leaves = await FirebaseService.getData("leave_requests");
      return leaves
        .filter((leave) => leave.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Erreur lors de la récupération des congés:", error);
      return [];
    }
  },

  // Récupérer toutes les demandes de congé (pour l'admin)
  async getAllLeaveRequests() {
    try {
      const leaves = await FirebaseService.getData("leave_requests");
      return leaves.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des demandes de congé:",
        error,
      );
      return [];
    }
  },

  // Approuver une demande de congé
  async approveLeave(leaveId, adminComment = "") {
    try {
      const updateData = {
        status: "approved",
        adminComment,
        updatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      };

      await FirebaseService.updateData("leave_requests", leaveId, updateData);
      return { success: true, message: "Congé approuvé" };
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      throw error;
    }
  },

  // Refuser une demande de congé
  async rejectLeave(leaveId, adminComment = "") {
    try {
      const updateData = {
        status: "rejected",
        adminComment,
        updatedAt: new Date().toISOString(),
        rejectedAt: new Date().toISOString(),
      };

      await FirebaseService.updateData("leave_requests", leaveId, updateData);
      return { success: true, message: "Congé refusé" };
    } catch (error) {
      console.error("Erreur lors du refus:", error);
      throw error;
    }
  },

  // Récupérer les statistiques de congés d'un employé
  async getLeaveStatistics(userId) {
    try {
      const leaves = await this.getEmployeeLeaves(userId);
      const approvedLeaves = leaves.filter((l) => l.status === "approved");

      const stats = {
        annual: approvedLeaves
          .filter((l) => l.leaveType === "annual")
          .reduce((sum, l) => sum + l.days, 0),
        sick: approvedLeaves
          .filter((l) => l.leaveType === "sick")
          .reduce((sum, l) => sum + l.days, 0),
        exceptional: approvedLeaves
          .filter((l) => l.leaveType === "exceptional")
          .reduce((sum, l) => sum + l.days, 0),
        pending: leaves.filter((l) => l.status === "pending").length,
      };

      return stats;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return { annual: 0, sick: 0, exceptional: 0, pending: 0 };
    }
  },

  // Calculer le nombre de jours
  calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de fin
    return diffDays;
  },
};

export default LeaveService;
