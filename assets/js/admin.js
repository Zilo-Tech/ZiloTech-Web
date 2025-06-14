class AdminManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.userData = null; // Store user data for sidebar
        this.init();
    }

    async init() {
        try {
            this.userData = await apiClient.get('/admin/dashboard/');
            this.updateSidebar();
        } catch (error) {
            console.error('Failed to load user data:', error.message);
        }
        this.setupEventListeners();
        this.loadPage(this.currentPage);
    }

    setupEventListeners() {
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('data-nav');
                this.loadPage(page);
            });
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            apiClient.clearTokens();
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast('Logged out successfully', 'success', 'top-right');
            }
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 1000);
        });
    }

    // admin.js
updateSidebar() {
    document.querySelectorAll('[data-nav]').forEach(link => {
        const page = link.getAttribute('data-nav');
        link.classList.toggle('bg-indigo-700', page === this.currentPage);
        link.classList.toggle('text-white', page === this.currentPage);
        link.classList.toggle('text-gray-300', page !== this.currentPage);
        link.classList.toggle('hover:bg-indigo-600', page !== this.currentPage);
    });

    const userNameElement = document.getElementById('user-name');
    const profilePicElement = document.getElementById('profile-pic');
    if (this.userData && userNameElement && profilePicElement) {
        userNameElement.textContent = this.userData.user.name || 'User';
        // Prepend backend base URL to relative profile_picture path
        let profilePicUrl = this.userData.user.profile_picture || 'https://via.placeholder.com/40';
        if (profilePicUrl && !profilePicUrl.startsWith('http')) {
            profilePicUrl = `http://localhost:8000/${profilePicUrl}`;
        }
        profilePicElement.src = profilePicUrl;
    }
}

    async loadPage(page) {
        this.currentPage = page;
        this.updateSidebar();
        const content = document.getElementById('main-content');
        content.innerHTML = this.getPageContent(page);

        switch (page) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'roles':
                await this.loadRoles();
                break;
            case 'team-members':
                await this.loadTeamMembers();
                break;
            case 'update-profile':
                await this.setupUpdateProfileForm();
                break;
            case 'blog':
            case 'projects':
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast(`${page.charAt(0).toUpperCase() + page.slice(1)} page coming soon`, 'info', 'top-right');
                }
                break;
        }
    }

    getPageContent(page) {
        const loader = `
            <div id="page-loader" class="flex justify-center items-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        `;
        switch (page) {
            case 'dashboard':
                return `
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold mb-4">Dashboard</h2>
                        <div id="dashboard-content" class="bg-white rounded-lg shadow-md p-6">
                            ${loader}
                            <h3 class="text-lg font-medium mb-4 hidden">Profile Information</h3>
                            <div id="profile-info" class="grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
                                <div><label class="block text-sm font-medium text-gray-700">Email</label><p id="email" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">Full Name</label><p id="name" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">Admin Status</label><p id="is_admin" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">Role</label><p id="role" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">Date Joined</label><p id="date_joined" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">Last Login</label><p id="last_login" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">Bio</label><p id="bio" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">Location</label><p id="location" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">GitHub URL</label><p id="github_url" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">LinkedIn URL</label><p id="linkedin_url" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">Twitter URL</label><p id="twitter_url" class="mt-1 text-gray-900"></p></div>
                                <div><label class="block text-sm font-medium text-gray-700">Language Preference</label><p id="language_preference" class="mt-1 text-gray-900"></p></div>
                            </div>
                        </div>
                    </div>
                `;
            case 'roles':
                return `
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-2xl font-semibold">Roles</h2>
                            <button id="create-role-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create Role</button>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="roles-table" class="bg-white divide-y divide-gray-200">
                                    <tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">${loader}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            case 'team-members':
                return `
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-2xl font-semibold">Team Members</h2>
                            <button id="create-team-member-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create Team Member</button>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Admin</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Active</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="team-members-table" class="bg-white divide-y divide-gray-200">
                                    <tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">${loader}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            case 'update-profile':
                return `
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold mb-4">Update Profile</h2>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <form id="update-profile-form" class="space-y-4" enctype="multipart/form-data">
                                <div>
                                    <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input type="text" id="name" name="name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                                <div>
                                    <label for="role_id" class="block text-sm font-medium text-gray-700">Role</label>
                                    <select id="role_id" name="role_id" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                        <option value="">Select...</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="profile_picture" class="block text-sm font-medium text-gray-700">Profile Picture</label>
                                    <input type="file" id="profile_picture" name="profile_picture" accept="image/*" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                                <div>
                                    <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
                                    <textarea id="bio" name="bio" rows="4" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                                </div>
                                <div>
                                    <label for="github_url" class="block text-sm font-medium text-gray-700">GitHub Username</label>
                                    <input type="text" id="github_url" name="github_url" placeholder="e.g., johndoe" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                                <div>
                                    <label for="linkedin_url" class="block text-sm font-medium text-gray-700">LinkedIn Username</label>
                                    <input type="text" id="linkedin_url" name="linkedin_url" placeholder="e.g., johndoe" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                                <div>
                                    <label for="twitter_url" class="block text-sm font-medium text-gray-700">Twitter Username</label>
                                    <input type="text" id="twitter_url" name="twitter_url" placeholder="e.g., johndoe" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                                <div>
                                    <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
                                    <input type="text" id="location" name="location" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                </div>
                                <div>
                                    <label for="language_preference" class="block text-sm font-medium text-gray-700">Language Preference</label>
                                    <select id="language_preference" name="language_preference" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                        <option value="">Select...</option>
                                        <option value="en">English</option>
                                        <option value="fr">French</option>
                                        <option value="es">Spanish</option>
                                    </select>
                                </div>
                                <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Update Profile</button>
                            </form>
                        </div>
                    </div>
                `;
            case 'blog':
                return `<div class="p-6"><h2 class="text-2xl font-semibold mb-4">Blog</h2><p class="text-gray-500">Blog functionality coming soon.</p></div>`;
            case 'projects':
                return `<div class="p-6"><h2 class="text-2xl font-semibold mb-4">Projects</h2><p class="text-gray-500">Projects functionality coming soon.</p></div>`;
        }
    }

    async loadDashboard() {
        try {
            const data = await apiClient.get('/admin/dashboard/');
            this.userData = data;

            const loader = document.getElementById('page-loader');
            const content = document.getElementById('dashboard-content');
            const profileInfo = document.getElementById('profile-info');
            const profileHeader = content.querySelector('h3');
            if (loader && profileInfo && profileHeader) {
                loader.classList.add('hidden');
                profileInfo.classList.remove('hidden');
                profileHeader.classList.remove('hidden');
            }

            const fields = ['email', 'name', 'is_admin', 'role', 'date_joined', 'last_login', 'bio', 'location', 'github_url', 'linkedin_url', 'twitter_url', 'language_preference'];
            for (const field of fields) {
                const element = document.getElementById(field);
                if (!element) {
                    console.warn(`DOM element #${field} not found`);
                    continue;
                }
                switch (field) {
                    case 'email':
                        element.textContent = data.user.email || 'N/A';
                        break;
                    case 'name':
                        element.textContent = data.user.name || 'N/A';
                        break;
                    case 'is_admin':
                        element.textContent = data.user.is_admin ? 'Yes' : 'No';
                        break;
                    case 'role':
                        element.textContent = data.user.role?.name || 'N/A';
                        break;
                    case 'date_joined':
                        element.textContent = data.user.date_joined ? new Date(data.user.date_joined).toLocaleString() : 'N/A';
                        break;
                    case 'last_login':
                        element.textContent = data.user.last_login ? new Date(data.user.last_login).toLocaleString() : 'N/A';
                        break;
                    case 'bio':
                        element.textContent = data.user.bio || 'N/A';
                        break;
                    case 'location':
                        element.textContent = data.user.location || 'N/A';
                        break;
                    case 'github_url':
                        element.textContent = data.user.github_url || 'N/A';
                        break;
                    case 'linkedin_url':
                        element.textContent = data.user.linkedin_url || 'N/A';
                        break;
                    case 'twitter_url':
                        element.textContent = data.user.twitter_url || 'N/A';
                        break;
                    case 'language_preference':
                        element.textContent = data.user.language_preference || 'N/A';
                        break;
                }
            }
            this.updateSidebar();
        } catch (error) {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.innerHTML = `<p class="text-red-500">Failed to load data: ${error.message}</p>`;
            }
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast('Failed to load profile: ' + error.message, 'error', 'top-right');
            }
            console.error('Dashboard error:', error.message, error);
        }
    }

    async loadRoles() {
        try {
            const roles = await apiClient.get('/roles/');
            const tbody = document.getElementById('roles-table');
            tbody.innerHTML = roles.length ? '' : `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No roles found</td></tr>`;

            roles.forEach(role => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.api_id || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.created_at ? new Date(role.created_at).toLocaleString() : 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.updated_at ? new Date(role.updated_at).toLocaleString() : 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button data-edit="${role.api_id}" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                        <button data-delete="${role.api_id}" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            const loader = document.getElementById('page-loader');
            if (loader) loader.classList.add('hidden');

            document.getElementById('create-role-btn').addEventListener('click', () => this.showCreateRoleForm());
            tbody.querySelectorAll('[data-edit]').forEach(btn => {
                btn.addEventListener('click', () => this.showEditRoleForm(btn.getAttribute('data-edit')));
            });
            tbody.querySelectorAll('[data-delete]').forEach(btn => {
                btn.addEventListener('click', () => this.deleteRole(btn.getAttribute('data-delete')));
            });
        } catch (error) {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.innerHTML = `<p class="text-red-500">Failed to load roles: ${error.message}</p>`;
            }
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast('Failed to load roles: ' + error.message, 'error', 'top-right');
            }
            console.error('Roles error:', error.message, error);
        }
    }

    showCreateRoleForm() {
        const modal = this.createModal('Create Role', `
            <form id="create-role-form" class="space-y-4">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Role Name</label>
                    <input type="text" id="name" name="name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create</button>
            </form>
        `);
        document.getElementById('create-role-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            try {
                await apiClient.post('/roles/', { name });
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Role created successfully', 'success', 'top-right');
                }
                modal.remove();
                this.loadRoles();
            } catch (error) {
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Failed to create role: ' + error.message, 'error', 'top-right');
                }
                console.error('Create role error:', error.message);
            }
        });
    }

    async showEditRoleForm(id) {
        try {
            const role = await apiClient.get(`/roles/${id}/`);
            const modal = this.createModal('Edit Role', `
                <form id="edit-role-form" class="space-y-4">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">Role Name</label>
                        <input type="text" id="name" name="name" value="${role.name}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Update</button>
                </form>
            `);
            document.getElementById('edit-role-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('name').value;
                try {
                    await apiClient.patch(`/roles/${id}/`, { name });
                    if (typeof toastManager !== 'undefined') {
                        toastManager.showToast('Role updated successfully', 'success', 'top-right');
                    }
                    modal.remove();
                    this.loadRoles();
                } catch (error) {
                    if (typeof toastManager !== 'undefined') {
                        toastManager.showToast('Failed to update role: ' + error.message, 'error', 'top-right');
                    }
                    console.error('Edit role error:', error.message);
                }
            });
        } catch (error) {
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast('Failed to load role: ' + error.message, 'error', 'top-right');
            }
            console.error('Edit role error:', error.message);
        }
    }

    async deleteRole(id) {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
                await apiClient.delete(`/roles/${id}/`);
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Role deleted successfully!', 'success', 'top-right');
                }
                this.loadRoles();
            } catch (error) {
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Failed to delete role: ' + error.message, 'error', 'top-right');
                }
                console.error('Delete role error:', error.message);
            }
        }
    }

    async loadTeamMembers() {
        try {
            const members = await apiClient.get('/team-members/');
            const tbody = document.getElementById('team-members-table');
            tbody.innerHTML = members.length ? '' : `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No team members found</td></tr>`;

            members.forEach(member => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${member.api_id || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${member.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${member.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${member.role?.name || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${member.is_admin ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${member.is_active ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button data-view="${member.api_id}" class="text-indigo-600 hover:text-indigo-900">View</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            const loader = document.getElementById('page-loader');
            if (loader) loader.classList.add('hidden');

            document.getElementById('create-team-member-btn').addEventListener('click', () => this.showCreateTeamMemberForm());
            tbody.querySelectorAll('[data-view]').forEach(btn => {
                btn.addEventListener('click', () => this.showTeamMemberDetails(btn.getAttribute('data-view')));
            });
        } catch (error) {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.innerHTML = `<p class="text-red-500">Failed to load team members: ${error.message}</p>`;
            }
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast('Failed to load team members: ' + error.message, 'error', 'top-right');
            }
            console.error('Team members error:', error.message, error);
        }
    }

    showCreateTeamMemberForm() {
        const modal = this.createModal('Create Team Member', `
            <form id="create-team-member-form" class="space-y-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" name="email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Register</button>
            </form>
        `);
        document.getElementById('create-team-member-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            try {
                await apiClient.post('/register/', { email });
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Team member registered successfully', 'success', 'top-right');
                }
                modal.remove();
                this.loadTeamMembers();
            } catch (error) {
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Failed to register team member: ' + error.message, 'error', 'top-right');
                }
                console.error('Create team member error:', error.message);
            }
        });
    }

    async showTeamMemberDetails(id) {
        try {
            const member = await apiClient.get(`/team-members/${id}/`);
            const modal = this.createModal('Team Member Details', `
                <div class="space-y-4">
                    <div><label class="block text-sm font-medium text-gray-700">Email</label><p class="mt-1 text-gray-900">${member.email}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Full Name</label><p class="mt-1 text-gray-900">${member.name}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Role</label><p class="mt-1 text-gray-900">${member.role?.name || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Admin Status</label><p class="mt-1 text-gray-900">${member.is_admin ? 'Yes' : 'No'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Active Status</label><p class="mt-1 text-gray-900">${member.is_active ? 'Yes' : 'No'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Date Joined</label><p class="mt-1 text-gray-900">${member.date_joined ? new Date(member.date_joined).toLocaleString() : 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Last Login</label><p class="mt-1 text-gray-900">${member.last_login ? new Date(member.last_login).toLocaleString() : 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Bio</label><p class="mt-1 text-gray-900">${member.bio || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Location</label><p class="mt-1 text-gray-900">${member.location || 'N/A'}</p></div>
                </div>
            `);
        } catch (error) {
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast('Failed to load team member details: ' + error.message, 'error', 'top-right');
            }
            console.error('Team member details error:', error.message);
        }
    }

    async setupUpdateProfileForm() {
        try {
            const [data, roles] = await Promise.all([
                apiClient.get('/admin/dashboard/'),
                apiClient.get('/roles/')
            ]);

            document.getElementById('name').value = data.user.name || '';
            document.getElementById('bio').value = data.user.bio || '';
            document.getElementById('github_url').value = data.user.github_url ? data.user.github_url.replace('https://github.com/', '') : '';
            document.getElementById('linkedin_url').value = data.user.linkedin_url ? data.user.linkedin_url.replace('https://linkedin.com/in/', '') : '';
            document.getElementById('twitter_url').value = data.user.twitter_url ? data.user.twitter_url.replace('https://twitter.com/', '') : '';
            document.getElementById('location').value = data.user.location || '';
            document.getElementById('language_preference').value = data.user.language_preference || '';

            const roleSelect = document.getElementById('role_id');
            roleSelect.innerHTML = '<option value="">Select...</option>';
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.api_id;
                option.textContent = role.name;
                if (data.user.role && data.user.role.api_id === role.api_id) {
                    option.selected = true;
                }
                roleSelect.appendChild(option);
            });

            document.getElementById('update-profile-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);

                const githubUsername = formData.get('github_url');
                if (githubUsername) {
                    formData.set('github_url', githubUsername.startsWith('http') ? githubUsername : `https://github.com/${githubUsername}`);
                }
                const linkedinUsername = formData.get('linkedin_url');
                if (linkedinUsername) {
                    formData.set('linkedin_url', linkedinUsername.startsWith('http') ? linkedinUsername : `https://linkedin.com/in/${linkedinUsername}`);
                }
                const twitterUsername = formData.get('twitter_url');
                if (twitterUsername) {
                    formData.set('twitter_url', twitterUsername.startsWith('http') ? twitterUsername : `https://twitter.com/${twitterUsername}`);
                }

                try {
                    const response = await fetch('http://localhost:8000/api/user/dashboard/', {
                        method: 'PUT',
                        headers: {
                            'Authorization': apiClient.getHeaders()['Authorization']
                        },
                        body: formData
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
                    }
                    const updatedData = await response.json();
                    this.userData = { user: updatedData };
                    if (typeof toastManager !== 'undefined') {
                        toastManager.showToast('Profile updated successfully', 'success', 'top-right');
                    }
                    this.loadPage('dashboard');
                } catch (error) {
                    if (typeof toastManager !== 'undefined') {
                        toastManager.showToast(`Failed to update profile: ${error.message}`, 'error', 'top-right');
                    }
                    console.error('Update profile error:', error.message);
                }
            });
        } catch (error) {
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast('Failed to load profile data: ' + error.message, 'error', 'top-right');
            }
            console.error('Update profile error:', error.message);
        }
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium">${title}</h3>
                    <button class="text-gray-500 hover:text-gray-700 close-modal">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        return modal;
    }
}

const adminManager = new AdminManager();
window.adminManager = adminManager;