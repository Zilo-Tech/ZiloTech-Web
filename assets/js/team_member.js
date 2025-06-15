class TeamMemberManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.userData = null;
        this.baseUrl = 'https://ziloteck-backend.onrender.com/api'; // Backend base URL for API
        this.isSidebarOpen = false;
        this.init();
    }

    async init() {
        try {
            this.userData = await apiClient.get('/user/dashboard/');
            this.updateSidebar();
        } catch (error) {
            console.error('Failed to load user data:', error.message);
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast(`Failed to load user data: ${error.message}`, 'error', 'top-right');
            }
        }
        this.setupEventListeners();
        this.loadPage(this.currentPage);
    }

    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('data-nav');
                this.loadPage(page);
                if (this.isSidebarOpen && window.innerWidth < 768) {
                    this.toggleSidebar();
                }
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                apiClient.clearTokens();
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Logged out successfully', 'success', 'top-right');
                }
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 1000);
            });
        }

        // Hamburger menu
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const hamburgerBtn = document.getElementById('hamburgerBtn');
            if (this.isSidebarOpen && window.innerWidth < 768 && !sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                this.toggleSidebar();
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        this.isSidebarOpen = !this.isSidebarOpen;
        sidebar.classList.toggle('translate-x-0', this.isSidebarOpen);
        sidebar.classList.toggle('-translate-x-full', !this.isSidebarOpen);
        // Toggle main content dimming
        const mainContent = document.querySelector('main');
        mainContent.classList.toggle('opacity-50', this.isSidebarOpen);
        mainContent.classList.toggle('pointer-events-none', this.isSidebarOpen);
    }

    fixImageUrl(imagePath) {
        if (imagePath && !imagePath.startsWith('http')) {
            return `https://ziloteck-backend.onrender.com/${imagePath.startsWith('media/') ? '' : 'media/'}${imagePath}`;
        }
        return imagePath || 'https://via.placeholder.com/40';
    }

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
            profilePicElement.src = this.fixImageUrl(this.userData.user.profile_picture);
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
            case 'blog':
                try {
                    await adminBlogProjectManager.loadPage('blog');
                } catch (error) {
                    content.innerHTML = `<p class="p-6 text-red-500">Failed to load blog: ${error.message}</p>`;
                    if (typeof toastManager !== 'undefined') {
                        toastManager.showToast(`Failed to load blog: ${error.message}`, 'error', 'top-right');
                    }
                }
                break;
            case 'update-profile':
                await this.setupUpdateProfileForm();
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
            case 'blog':
                return `<div id="main-content" class="p-6">${loader}</div>`;
            case 'update-profile':
                return `
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold mb-4">Update Profile</h2>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <form id="update-profile-form" class="space-y-4 max-h-[70vh] overflow-y-auto" enctype="multipart/form-data">
                                <!-- Tab Navigation -->
                                <div class="border-b border-gray-200 bg-gray-50 px-4 py-2 sticky top-0 z-10">
                                    <nav class="-mb-px flex space-x-4" aria-label="Tabs">
                                        <button type="button" data-tab="basic-info" class="tab-button border-b-2 border-indigo-500 text-indigo-600 py-2 px-1 text-sm font-medium">Basic Info</button>
                                        <button type="button" data-tab="social-links" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Social Links</button>
                                        <button type="button" data-tab="password" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Password</button>
                                    </nav>
                                </div>
    
                                <!-- Tab Content -->
                                <div id="basic-info" class="tab-content space-y-4 px-4">
                                    <div>
                                        <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input type="text" id="name" name="name" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    </div>
                                    <div>
                                        <label for="role_id" class="block text-sm font-medium text-gray-700">Role</label>
                                        <select id="role_id" name="role_id" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                            <option value="">Select...</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
                                        <textarea id="bio" name="bio" rows="4" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
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
                                    <div>
                                        <label for="profile_picture" class="block text-sm font-medium text-gray-700">Profile Picture</label>
                                        <input type="file" id="profile_picture" name="profile_picture" accept="image/*" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                        <img id="image-preview" class="mt-2 hidden max-w-xs h-auto" src="" alt="Image Preview">
                                    </div>
                                </div>
    
                                <div id="social-links" class="tab-content space-y-4 px-4 hidden">
                                    <div>
                                        <label for="github_url" class="block text-sm font-medium text-gray-700">GitHub Username</label>
                                        <input type="text" id="github_url" name="github_url" placeholder="e.g., fotsoeddy" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    </div>
                                    <div>
                                        <label for="linkedin_url" class="block text-sm font-medium text-gray-700">LinkedIn Username</label>
                                        <input type="text" id="linkedin_url" name="linkedin_url" placeholder="e.g., fotsoeddy" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    </div>
                                    <div>
                                        <label for="twitter_url" class="block text-sm font-medium text-gray-700">Twitter Username</label>
                                        <input type="text" id="twitter_url" name="twitter_url" placeholder="e.g., fotsoeddy" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    </div>
                                </div>
    
                                <div id="password" class="tab-content space-y-4 px-4 hidden">
                                    <div>
                                        <label for="old_password" class="block text-sm font-medium text-gray-700">Current Password</label>
                                        <input type="password" id="old_password" name="old_password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    </div>
                                    <div>
                                        <label for="new_password" class="block text-sm font-medium text-gray-700">New Password</label>
                                        <input type="password" id="new_password" name="new_password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    </div>
                                    <div>
                                        <label for="confirm_new_password" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                        <input type="password" id="confirm_new_password" name="confirm_new_password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    </div>
                                </div>
    
                                <!-- Navigation Buttons -->
                                <div class="flex justify-between mt-4 px-4">
                                    <button type="button" id="prev-tab" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 hidden">Previous</button>
                                    <button type="button" id="next-tab" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Next</button>
                                    <button type="submit" id="submit-profile" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 hidden">Update Profile</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
        }
    }

    async loadDashboard() {
        try {
            const data = await apiClient.get('/user/dashboard/');
            this.userData = data;

            const content = document.getElementById('dashboard-content');
            const loader = document.getElementById('page-loader');
            const profileInfo = document.getElementById('profile-info');
            const profileHeader = content?.querySelector('h3');

            if (!content || !loader || !profileInfo || !profileHeader) {
                console.warn('Dashboard DOM elements missing:', {
                    content: !!content,
                    loader: !!loader,
                    profileInfo: !!profileInfo,
                    profileHeader: !!profileHeader
                });
                throw new Error('Required dashboard elements not found in DOM');
            }

            loader.classList.add('hidden');
            profileInfo.classList.remove('hidden');
            profileHeader.classList.remove('hidden');

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
        } catch (error) {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.innerHTML = `<p class="text-red-500">Failed to load dashboard: ${error.message}</p>`;
            }
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast(`Failed to load dashboard: ${error.message}`, 'error', 'top-right');
            }
            console.error('Dashboard error:', error.message);
        }
    }

    
    async setupUpdateProfileForm() {
        try {
            const [userData, roles] = await Promise.all([
                apiClient.get('/user/dashboard/'),
                apiClient.get('/roles/')
            ]);
    
            // Pre-fill form fields
            const fields = ['name', 'bio', 'github_url', 'linkedin_url', 'twitter_url', 'location', 'language_preference', 'role_id'];
            fields.forEach(field => {
                const input = document.getElementById(field);
                if (!input) {
                    console.warn(`DOM element #${field} not found`);
                    return;
                }
                switch (field) {
                    case 'name':
                        input.value = userData.user.name || '';
                        break;
                    case 'bio':
                        input.value = userData.user.bio || '';
                        break;
                    case 'github_url':
                        input.value = userData.user.github_url ? userData.user.github_url.replace('https://github.com/', '') : '';
                        break;
                    case 'linkedin_url':
                        input.value = userData.user.linkedin_url ? userData.user.linkedin_url.replace('https://linkedin.com/in/', '') : '';
                        break;
                    case 'twitter_url':
                        input.value = userData.user.twitter_url ? userData.user.twitter_url.replace('https://twitter.com/', '') : '';
                        break;
                    case 'location':
                        input.value = userData.user.location || '';
                        break;
                    case 'language_preference':
                        input.value = userData.user.language_preference || '';
                        break;
                    case 'role_id':
                        input.innerHTML = `<option value="">Select...</option>` + roles.map(role => `<option value="${role.api_id}" ${userData.user.role?.api_id === role.api_id ? 'selected' : ''}>${role.name}</option>`).join('');
                        break;
                }
            });
    
            // Add skills input to basic-info tab
            const basicInfoTab = document.getElementById('basic-info');
            if (!basicInfoTab) {
                console.error('Basic Info tab not found');
                throw new Error('Basic Info tab not found');
            }
            const skillsInput = document.createElement('div');
            skillsInput.className = 'mt-4'; // Add margin for consistency
            skillsInput.innerHTML = `
                <label for="skills" class="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                <input type="text" id="skills" name="skills" value="${userData.user.skills ? userData.user.skills.join(', ') : ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            `;
            const roleIdDiv = document.getElementById('role_id').parentElement;
            basicInfoTab.insertBefore(skillsInput, roleIdDiv);
    
            // Profile picture preview
            const imageInput = document.getElementById('profile_picture');
            const imagePreview = document.getElementById('image-preview');
            if (userData.user.profile_picture) {
                imagePreview.src = this.fixImageUrl(userData.user.profile_picture);
                imagePreview.classList.remove('hidden');
            }
            imageInput.addEventListener('change', () => {
                if (imageInput.files && imageInput.files[0]) {
                    imagePreview.src = URL.createObjectURL(imageInput.files[0]);
                    imagePreview.classList.remove('hidden');
                } else {
                    imagePreview.classList.add('hidden');
                }
            });
    
            // Tab switching logic
            const tabs = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            const prevBtn = document.querySelector('#prev-tab');
            const nextBtn = document.querySelector('#next-tab');
            const submitBtn = document.querySelector('#submit-profile');
            let currentTab = 0;
    
            const showTab = (index) => {
                tabs.forEach((tab, i) => {
                    tab.classList.toggle('border-indigo-500', i === index);
                    tab.classList.toggle('text-indigo-600', i === index);
                    tab.classList.toggle('border-transparent', i !== index);
                    tab.classList.toggle('text-gray-500', i !== index);
                    tab.classList.toggle('hover:text-gray-700', i !== index);
                    tab.classList.toggle('hover:border-gray-300', i !== index);
                });
                tabContents.forEach((content, i) => {
                    content.classList.toggle('hidden', i !== index);
                });
                prevBtn.classList.toggle('hidden', index === 0);
                nextBtn.classList.toggle('hidden', index === tabContents.length - 1);
                submitBtn.classList.toggle('hidden', index !== tabContents.length - 1);
                currentTab = index;
            };
    
            tabs.forEach((tab, index) => {
                tab.addEventListener('click', () => showTab(index));
            });
            prevBtn.addEventListener('click', () => showTab(currentTab - 1));
            nextBtn.addEventListener('click', () => showTab(currentTab + 1));
            showTab(0);
    
            // Form submission
            document.getElementById('update-profile-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newPassword = formData.get('new_password');
                const confirmPassword = formData.get('confirm_new_password');
                const oldPassword = formData.get('old_password');
    
                // Validate passwords
                if (newPassword || confirmPassword) {
                    if (newPassword !== confirmPassword) {
                        toastManager.showToast('New password and confirmation do not match', 'error', 'top-right');
                        return;
                    }
                    if (!oldPassword) {
                        toastManager.showToast('Current password is required to change password', 'error', 'top-right');
                        return;
                    }
                }
    
                // Format social URLs and skills
                const githubUrl = formData.get('github_url') ? `https://github.com/${formData.get('github_url')}` : '';
                const linkedinUrl = formData.get('linkedin_url') ? `https://linkedin.com/in/${formData.get('linkedin_url')}` : '';
                const twitterUrl = formData.get('twitter_url') ? `https://twitter.com/${formData.get('twitter_url')}` : '';
                const skills = formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()).filter(s => s) : [];
    
                // Prepare profile update payload
                const profileData = new FormData();
                ['name', 'role_id', 'bio', 'location', 'language_preference'].forEach(field => {
                    const value = formData.get(field);
                    if (value !== null && value !== '') profileData.append(field, value);
                });
                if (formData.get('profile_picture') && formData.get('profile_picture').size > 0) {
                    profileData.append('profile_picture', formData.get('profile_picture'));
                }
                if (githubUrl) profileData.append('github_url', githubUrl);
                if (linkedinUrl) profileData.append('linkedin_url', linkedinUrl);
                if (twitterUrl) profileData.append('twitter_url', twitterUrl);
                if (skills.length > 0) profileData.append('skills', JSON.stringify(skills));
    
                // Log FormData for debugging
                console.log('Profile FormData entries:');
                for (let [key, value] of profileData.entries()) {
                    console.log(`${key}: ${value}`);
                }
    
                try {
                    // Update profile
                    let profileUpdated = false;
                    if (Array.from(profileData.entries()).length > 0) {
                        const profileResponse = await apiClient.upload('/user/dashboard/', profileData);
                        console.log('Profile update response:', profileResponse);
                        profileUpdated = true;
                    }
    
                    // Update password if provided
                    let passwordUpdated = false;
                    if (newPassword && oldPassword) {
                        const passwordResponse = await apiClient.post('/change-password/', {
                            old_password: oldPassword,
                            new_password: newPassword,
                            confirm_new_password: confirmPassword
                        });
                        console.log('Password update response:', passwordResponse);
                        passwordUpdated = true;
                    }
    
                    // Show appropriate toast message
                    if (profileUpdated && passwordUpdated) {
                        toastManager.showToast('Profile and password updated successfully', 'success', 'top-right');
                    } else if (profileUpdated) {
                        toastManager.showToast('Profile updated successfully', 'success', 'top-right');
                    } else if (passwordUpdated) {
                        toastManager.showToast('Password updated successfully', 'success', 'top-right');
                    }
    
                    // Refresh user data
                    this.userData = await apiClient.get('/user/dashboard/');
                    console.log('Refreshed user data:', this.userData);
                    this.updateSidebar();
    
                    // Reload dashboard if on dashboard page
                    if (this.currentPage === 'dashboard') {
                        await this.loadDashboard();
                    }
                } catch (error) {
                    console.error('Update profile error:', error.message);
                    toastManager.showToast(`Failed to update profile: ${error.message}`, 'error', 'top-right');
                }
            });
        } catch (error) {
            console.error('Setup profile form error:', error.message);
            toastManager.showToast(`Failed to load profile data: ${error.message}`, 'error', 'top-right');
        }
    }
}

const teamMemberManager = new TeamMemberManager();