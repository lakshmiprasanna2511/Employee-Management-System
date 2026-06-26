// Employee Management System - Main Script

class EmployeeManager {
    constructor() {
        this.employees = this.loadFromLocalStorage() || [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayEmployees();
        this.updateStats();
    }

    setupEventListeners() {
        // Add Employee Button
        document.getElementById('addEmployeeBtn').addEventListener('click', () => this.openAddModal());

        // Modal Controls
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('closeDetailsBtn').addEventListener('click', () => this.closeDetailsModal());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());

        // Form Submission
        document.getElementById('employeeForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Delete Confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());

        // Search and Filter
        document.getElementById('searchInput').addEventListener('input', () => this.filterEmployees());
        document.getElementById('departmentFilter').addEventListener('change', () => this.filterEmployees());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterEmployees());

        // Close modals on background click
        window.addEventListener('click', (e) => {
            const employeeModal = document.getElementById('employeeModal');
            const detailsModal = document.getElementById('detailsModal');
            const deleteModal = document.getElementById('deleteModal');

            if (e.target === employeeModal) this.closeModal();
            if (e.target === detailsModal) this.closeDetailsModal();
            if (e.target === deleteModal) this.closeDeleteModal();
        });
    }

    openAddModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add Employee';
        document.getElementById('employeeForm').reset();
        document.getElementById('employeeId').focus();
        document.getElementById('employeeModal').classList.add('show');
    }

    openEditModal(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (!employee) return;

        this.currentEditId = id;
        document.getElementById('modalTitle').textContent = 'Edit Employee';
        
        // Populate form with employee data
        document.getElementById('employeeId').value = employee.id;
        document.getElementById('firstName').value = employee.firstName;
        document.getElementById('lastName').value = employee.lastName;
        document.getElementById('email').value = employee.email;
        document.getElementById('phone').value = employee.phone;
        document.getElementById('department').value = employee.department;
        document.getElementById('position').value = employee.position;
        document.getElementById('salary').value = employee.salary;
        document.getElementById('joinDate').value = employee.joinDate;
        document.getElementById('status').value = employee.status;

        document.getElementById('employeeModal').classList.add('show');
    }

    closeModal() {
        document.getElementById('employeeModal').classList.remove('show');
        document.getElementById('employeeForm').reset();
        this.currentEditId = null;
    }

    closeDetailsModal() {
        document.getElementById('detailsModal').classList.remove('show');
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('show');
        this.currentDeleteId = null;
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const employeeData = {
            id: document.getElementById('employeeId').value.trim(),
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            department: document.getElementById('department').value,
            position: document.getElementById('position').value.trim(),
            salary: parseFloat(document.getElementById('salary').value),
            joinDate: document.getElementById('joinDate').value,
            status: document.getElementById('status').value,
            createdAt: this.currentEditId ? this.employees.find(e => e.id === this.currentEditId).createdAt : new Date().toISOString()
        };

        // Validation
        if (!this.validateEmployee(employeeData)) {
            return;
        }

        if (this.currentEditId) {
            // Update existing employee
            const index = this.employees.findIndex(e => e.id === this.currentEditId);
            if (index !== -1) {
                this.employees[index] = employeeData;
                this.showToast('Employee updated successfully!', 'success');
            }
        } else {
            // Check for duplicate ID
            if (this.employees.some(e => e.id === employeeData.id)) {
                this.showToast('Employee ID already exists!', 'error');
                return;
            }
            // Add new employee
            this.employees.push(employeeData);
            this.showToast('Employee added successfully!', 'success');
        }

        this.saveToLocalStorage();
        this.displayEmployees();
        this.updateStats();
        this.closeModal();
    }

    validateEmployee(employee) {
        if (!employee.id || !employee.firstName || !employee.lastName || !employee.email || !employee.phone) {
            this.showToast('Please fill in all required fields', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(employee.email)) {
            this.showToast('Please enter a valid email address', 'error');
            return false;
        }

        if (employee.salary < 0) {
            this.showToast('Salary cannot be negative', 'error');
            return false;
        }

        return true;
    }

    openViewModal(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (!employee) return;

        const detailsContent = document.getElementById('detailsContent');
        detailsContent.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Employee ID:</div>
                <div class="detail-value">${this.escapeHtml(employee.id)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Full Name:</div>
                <div class="detail-value">${this.escapeHtml(employee.firstName)} ${this.escapeHtml(employee.lastName)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value"><a href="mailto:${this.escapeHtml(employee.email)}">${this.escapeHtml(employee.email)}</a></div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${this.escapeHtml(employee.phone)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Department:</div>
                <div class="detail-value">${this.escapeHtml(employee.department)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Position:</div>
                <div class="detail-value">${this.escapeHtml(employee.position)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Salary:</div>
                <div class="detail-value">$${this.formatNumber(employee.salary)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Join Date:</div>
                <div class="detail-value">${this.formatDate(employee.joinDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="status-badge status-${employee.status.toLowerCase().replace(' ', '-')}">
                        ${this.escapeHtml(employee.status)}
                    </span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Created:</div>
                <div class="detail-value">${this.formatDateTime(employee.createdAt)}</div>
            </div>
        `;

        document.getElementById('detailsModal').classList.add('show');
    }

    openDeleteModal(id) {
        this.currentDeleteId = id;
        document.getElementById('deleteModal').classList.add('show');
    }

    confirmDelete() {
        if (!this.currentDeleteId) return;

        const employee = this.employees.find(e => e.id === this.currentDeleteId);
        this.employees = this.employees.filter(e => e.id !== this.currentDeleteId);
        
        this.saveToLocalStorage();
        this.displayEmployees();
        this.updateStats();
        this.closeDeleteModal();
        this.showToast(`Employee ${employee.firstName} ${employee.lastName} deleted successfully!`, 'success');
    }

    filterEmployees() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const department = document.getElementById('departmentFilter').value;
        const status = document.getElementById('statusFilter').value;

        const filtered = this.employees.filter(emp => {
            const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm) || emp.id.toLowerCase().includes(searchTerm);
            const matchesDept = !department || emp.department === department;
            const matchesStatus = !status || emp.status === status;

            return matchesSearch && matchesDept && matchesStatus;
        });

        this.displayEmployees(filtered);
    }

    displayEmployees(employeesToDisplay = this.employees) {
        const tableBody = document.getElementById('employeesTableBody');
        const emptyState = document.getElementById('emptyState');

        if (employeesToDisplay.length === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');

        tableBody.innerHTML = employeesToDisplay.map(emp => `
            <tr>
                <td>${this.escapeHtml(emp.id)}</td>
                <td>${this.escapeHtml(emp.firstName)} ${this.escapeHtml(emp.lastName)}</td>
                <td>${this.escapeHtml(emp.email)}</td>
                <td>${this.escapeHtml(emp.phone)}</td>
                <td>${this.escapeHtml(emp.department)}</td>
                <td>${this.escapeHtml(emp.position)}</td>
                <td>
                    <span class="status-badge status-${emp.status.toLowerCase().replace(' ', '-')}">
                        ${this.escapeHtml(emp.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-view btn-sm" onclick="manager.openViewModal('${this.escapeHtml(emp.id)}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-edit btn-sm" onclick="manager.openEditModal('${this.escapeHtml(emp.id)}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete btn-sm" onclick="manager.openDeleteModal('${this.escapeHtml(emp.id)}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const total = this.employees.length;
        const active = this.employees.filter(e => e.status === 'Active').length;
        const inactive = this.employees.filter(e => e.status === 'Inactive').length;
        const departments = new Set(this.employees.map(e => e.department)).size;

        document.getElementById('totalEmployees').textContent = total;
        document.getElementById('activeEmployees').textContent = active;
        document.getElementById('inactiveEmployees').textContent = inactive;
        document.getElementById('totalDepartments').textContent = departments;
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveToLocalStorage() {
        localStorage.setItem('employees', JSON.stringify(this.employees));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('employees');
        return data ? JSON.parse(data) : null;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatNumber(num) {
        return num.toLocaleString('en-US');
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // Export data as CSV
    exportAsCSV() {
        if (this.employees.length === 0) {
            this.showToast('No employees to export', 'info');
            return;
        }

        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Position', 'Salary', 'Join Date', 'Status'];
        const rows = this.employees.map(emp => [
            emp.id,
            emp.firstName,
            emp.lastName,
            emp.email,
            emp.phone,
            emp.department,
            emp.position,
            emp.salary,
            emp.joinDate,
            emp.status
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('Employee data exported successfully!', 'success');
    }

    // Import sample data for demo
    loadSampleData() {
        this.employees = [
            {
                id: 'EMP001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@company.com',
                phone: '+1 (555) 123-4567',
                department: 'IT',
                position: 'Senior Developer',
                salary: 95000,
                joinDate: '2022-03-15',
                status: 'Active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'EMP002',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@company.com',
                phone: '+1 (555) 234-5678',
                department: 'HR',
                position: 'HR Manager',
                salary: 75000,
                joinDate: '2021-07-20',
                status: 'Active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'EMP003',
                firstName: 'Michael',
                lastName: 'Johnson',
                email: 'michael.johnson@company.com',
                phone: '+1 (555) 345-6789',
                department: 'Finance',
                position: 'Finance Analyst',
                salary: 65000,
                joinDate: '2023-01-10',
                status: 'Active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'EMP004',
                firstName: 'Sarah',
                lastName: 'Williams',
                email: 'sarah.williams@company.com',
                phone: '+1 (555) 456-7890',
                department: 'Operations',
                position: 'Operations Manager',
                salary: 80000,
                joinDate: '2022-05-12',
                status: 'Active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'EMP005',
                firstName: 'Robert',
                lastName: 'Brown',
                email: 'robert.brown@company.com',
                phone: '+1 (555) 567-8901',
                department: 'Marketing',
                position: 'Marketing Specialist',
                salary: 60000,
                joinDate: '2023-06-01',
                status: 'On Leave',
                createdAt: new Date().toISOString()
            }
        ];

        this.saveToLocalStorage();
        this.displayEmployees();
        this.updateStats();
        this.showToast('Sample data loaded successfully!', 'success');
    }
}

// Initialize the application
let manager;

document.addEventListener('DOMContentLoaded', () => {
    manager = new EmployeeManager();

    // Load sample data if no employees exist
    if (manager.employees.length === 0) {
        manager.loadSampleData();
    }
});