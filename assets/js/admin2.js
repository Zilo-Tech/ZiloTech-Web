class AdminBlogProjectManager {
    constructor() {
        this.currentPage = null;
        this.baseUrl = 'http://localhost:8000/api'; // Updated base URL for API and media
    }

    // Initialize by setting up event listeners for blog/project pages
    init() {
        // Called externally by admin.js or HTML
    }

    // Load a specific page (blog or projects)
    async loadPage(page) {
        this.currentPage = page;
        const content = document.getElementById('main-content');
        content.innerHTML = this.getPageContent(page);

        switch (page) {
            case 'blog':
                await this.loadBlogs();
                break;
            case 'projects':
                await this.loadProjects();
                break;
        }
    }

    // Generate page content for blog/projects
    getPageContent(page) {
        const loader = `
            <div id="page-loader" class="flex justify-center items-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        `;
        switch (page) {
            case 'blog':
                return `
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-2xl font-semibold">Blog Posts</h2>
                            <button id="create-blog-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create Blog Post</button>
                        </div>
                        <div class="space-x-2">
                            <button id="create-blog-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create Manual Blog</button>
                            <button id="create-ai-blog-btn" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Create AI Blog</button>
                        </div>

                        <div class="bg-white rounded-lg shadow-md p-6">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="blogs-table" class="bg-white divide-y divide-gray-200">
                                    <tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">${loader}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            case 'projects':
                return `
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-2xl font-semibold">Projects</h2>
                            <button id="create-project-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create Project</button>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="projects-table" class="bg-white divide-y divide-gray-200">
                                    <tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">${loader}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
        }
    }

    // Fix relative image URLs
    fixImageUrl(imagePath) {
        if (imagePath && !imagePath.startsWith('http')) {
            return `${this.baseUrl}/${imagePath.startsWith('media/') ? '' : 'media/'}${imagePath}`;
        }
        return imagePath || 'https://via.placeholder.com/150';
    }

    // Load all blog posts
    async loadBlogs() {
        try {
            const blogs = await apiClient.get('/blogs/');
            const tbody = document.getElementById('blogs-table');
            tbody.innerHTML = blogs.length ? '' : `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No blog posts found</td></tr>`;

            blogs.forEach(blog => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${blog.api_id || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${blog.title}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${blog.author?.name || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${blog.status || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${blog.published_date ? new Date(blog.published_date).toLocaleDateString() : 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button data-view="${blog.api_id}" class="text-indigo-600 hover:text-indigo-900 mr-2">View</button>
                        <button data-edit="${blog.api_id}" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                        <button data-delete="${blog.api_id}" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            const loader = document.getElementById('page-loader');
            if (loader) loader.classList.add('hidden');

            document.getElementById('create-blog-btn').addEventListener('click', () => this.showCreateBlogForm());
            tbody.querySelectorAll('[data-view]').forEach(btn => {
                btn.addEventListener('click', () => this.showBlogDetails(btn.getAttribute('data-view')));
            });
            tbody.querySelectorAll('[data-edit]').forEach(btn => {
                btn.addEventListener('click', () => this.showEditBlogForm(btn.getAttribute('data-edit')));
            });
            tbody.querySelectorAll('[data-delete]').forEach(btn => {
                btn.addEventListener('click', () => this.deleteBlog(btn.getAttribute('data-delete')));
            });

            // Add to loadBlogs method, after existing event listeners
            document.getElementById('create-ai-blog-btn').addEventListener('click', () => this.showCreateAIBlogForm());

        } catch (error) {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.innerHTML = `<p class="text-red-500">Failed to load blogs: ${error.message}</p>`;
            }
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast(`Failed to load blogs: ${error.message}`, 'error', 'top-right');
            }
            console.error('Blogs error:', error.message);
        }
    }

    async showCreateAIBlogForm() {
    const modal = this.createModal('Create AI Blog Post', `
        <form id="create-ai-blog-form" class="space-y-4">
            <div>
                <label for="user_query" class="block text-sm font-medium text-gray-700">Blog Topic</label>
                <input type="text" id="user_query" name="user_query" value="Write a blog post about technology" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
                <label for="language_id" class="block text-sm font-medium text-gray-700">Language</label>
                <select id="language_id" name="language_id" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                </select>
            </div>
            <div>
                <label for="source" class="block text-sm font-medium text-gray-700">Source</label>
                <select id="source" name="source" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="internal">Internal Knowledge</option>
                    <option value="web">Web Search</option>
                    <option value="both">Both</option>
                </select>
            </div>
            <div>
                <label for="prompt_version" class="block text-sm font-medium text-gray-700">Prompt Version</label>
                <input type="text" id="prompt_version" name="prompt_version" value="v1" readonly class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm">
            </div>
            <div>
                <label for="user_email" class="block text-sm font-medium text-gray-700">User Email</label>
                <input type="email" id="user_email" name="user_email" value="eddy@gmail.com" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="flex justify-end mt-4">
                <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Generate Blog</button>
            </div>
        </form>
    `);

    modal.querySelector('#create-ai-blog-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            user_query: formData.get('user_query'),
            language_id: formData.get('language_id'),
            source: formData.get('source'),
            prompt_version: formData.get('prompt_version'),
            user_email: formData.get('user_email'),
        };

        try {
            const response = await apiClient.post('/agent/blog-agent/', data);
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast(`AI Blog generation started. Task ID: ${response.task_id}`, 'success', 'top-right');
            }
            modal.remove();
            // Reload blogs after a delay to check for new blog
            setTimeout(() => this.loadBlogs(), 5000);
        } catch (error) {
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast(`Failed to start AI Blog generation: ${error.message}`, 'error', 'top-right');
            }
            console.error('AI Blog creation error:', error.message);
        }
    });
}

    // Show form to create a blog post
    async showCreateBlogForm() {
        try {
            const teamMembers = await apiClient.get('/team-members/');
            const modal = this.createModal('Create Blog Post', `
                <form id="create-blog-form" class="space-y-4 max-h-[70vh] overflow-y-auto" enctype="multipart/form-data">
                    <!-- Tab Navigation -->
                    <div class="border-b border-gray-200 bg-gray-50 px-4 py-2 sticky top-0 z-10">
                        <nav class="-mb-px flex space-x-4" aria-label="Tabs">
                            <button type="button" data-tab="basic-info" class="tab-button border-b-2 border-indigo-500 text-indigo-600 py-2 px-1 text-sm font-medium">Basic Info</button>
                            <button type="button" data-tab="details" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Details</button>
                            <button type="button" data-tab="links-image" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Links & Image</button>
                        </nav>
                    </div>

                    <!-- Tab Content -->
                    <div id="basic-info" class="tab-content space-y-4 px-4">
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="title" name="title" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="subtitle" class="block text-sm font-medium text-gray-700">Subtitle</label>
                            <input type="text" id="subtitle" name="subtitle" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="author_id" class="block text-sm font-medium text-gray-700">Author</label>
                            <select id="author_id" name="author_id" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="">Select Author</option>
                                ${teamMembers.map(member => `<option value="${member.api_id}">${member.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" name="status" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label for="language" class="block text-sm font-medium text-gray-700">Language</label>
                            <select id="language" name="language" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="en">English</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                    </div>

                    <div id="details" class="tab-content space-y-4 px-4 hidden">
                        <div>
                            <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
                            <textarea id="content" name="content" rows="6" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                        </div>
                        <div>
                            <label for="excerpt" class="block text-sm font-medium text-gray-700">Excerpt</label>
                            <textarea id="excerpt" name="excerpt" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                        </div>
                        <div>
                            <label for="read_time_minutes" class="block text-sm font-medium text-gray-700">Read Time (Minutes)</label>
                            <input type="number" id="read_time_minutes" name="read_time_minutes" min="1" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="tags" class="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                            <input type="text" id="tags" name="tags" placeholder="e.g., AI, Tech" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="seo_keywords" class="block text-sm font-medium text-gray-700">SEO Keywords (comma-separated)</label>
                            <input type="text" id="seo_keywords" name="seo_keywords" placeholder="e.g., AI, Django" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="allow_comments" class="block text-sm font-medium text-gray-700">Allow Comments</label>
                            <input type="checkbox" id="allow_comments" name="allow_comments" class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                        </div>
                    </div>

                    <div id="links-image" class="tab-content space-y-4 px-4 hidden">
                        <div>
                            <label for="published_date" class="block text-sm font-medium text-gray-700">Published Date</label>
                            <input type="datetime-local" id="published_date" name="published_date" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="featured_image" class="block text-sm font-medium text-gray-700">Featured Image</label>
                            <input type="file" id="featured_image" name="featured_image" accept="image/*" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <img id="image-preview" class="mt-2 hidden max-w-xs h-auto" src="" alt="Image Preview">
                        </div>
                    </div>

                    <!-- Navigation Buttons -->
                    <div class="flex justify-between mt-4 px-4">
                        <button type="button" id="prev-tab" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 hidden">Previous</button>
                        <button type="button" id="next-tab" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Next</button>
                        <button type="submit" id="submit-blog" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 hidden">Create</button>
                    </div>
                </form>
            `);

            // Tab switching logic
            const tabs = modal.querySelectorAll('.tab-button');
            const tabContents = modal.querySelectorAll('.tab-content');
            const prevBtn = modal.querySelector('#prev-tab');
            const nextBtn = modal.querySelector('#next-tab');
            const submitBtn = modal.querySelector('#submit-blog');
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

            // Add image preview
            const imageInput = modal.querySelector('#featured_image');
            const imagePreview = modal.querySelector('#image-preview');
            imageInput.addEventListener('change', () => {
                if (imageInput.files && imageInput.files[0]) {
                    imagePreview.src = URL.createObjectURL(imageInput.files[0]);
                    imagePreview.classList.remove('hidden');
                }
            });

            modal.querySelector('#create-blog-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                formData.set('allow_comments', formData.get('allow_comments') === 'on' ? 'true' : 'false');
                const tags = formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean) : [];
                const seoKeywords = formData.get('seo_keywords') ? formData.get('seo_keywords').split(',').map(kw => kw.trim()).filter(Boolean) : [];
                formData.set('tags', JSON.stringify(tags));
                formData.set('seo_keywords', JSON.stringify(seoKeywords));

                try {
                    const response = await fetch(`${this.baseUrl}/blogs/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': apiClient.getHeaders()['Authorization']
                        },
                        body: formData
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(JSON.stringify(errorData) || `HTTP error! Status: ${response.status}`);
                    }
                    if (typeof toastManager !== 'undefined') {
                        toastManager.showToast('Blog created successfully', 'success', 'top-right');
                    }
                    modal.remove();
                    this.loadBlogs();
                } catch (error) {
                    if (typeof toastManager !== 'undefined') {
                        toastManager.showToast(`Failed to create blog: ${error.message}`, 'error', 'top-right');
                    }
                    console.error('Create blog error:', error.message);
                }
            });
        } catch (error) {
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast(`Failed to load team members: ${error.message}`, 'error', 'top-right');
            }
            console.error('Create blog error:', error.message);
        }
    }

    // Show blog post details
    async showBlogDetails(id) {
        try {
            const blog = await apiClient.get(`/blogs/${id}/`);
            const modal = this.createModal('Blog Post Details', `
                <div class="space-y-4 max-h-[80vh] overflow-y-auto">
                    <div><label class="block text-sm font-medium text-gray-700">Title</label><p class="mt-1 text-gray-900">${blog.title}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Subtitle</label><p class="mt-1 text-gray-900">${blog.subtitle || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Author</label><p class="mt-1 text-gray-900">${blog.author?.name || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Status</label><p class="mt-1 text-gray-900">${blog.status || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Language</label><p class="mt-1 text-gray-900">${blog.language || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Published Date</label><p class="mt-1 text-gray-900">${blog.published_date ? new Date(blog.published_date).toLocaleDateString() : 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Content</label><p class="mt-1 text-gray-900">${blog.content || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Excerpt</label><p class="mt-1 text-gray-900">${blog.excerpt || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Featured Image</label><img class="mt-1 max-w-xs h-auto" src="${this.fixImageUrl(blog.featured_image)}" alt="Featured Image"></div>
                    <div><label class="block text-sm font-medium text-gray-700">Read Time</label><p class="mt-1 text-gray-900">${blog.read_time_minutes || 'N/A'} minutes</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Tags</label><p class="mt-1 text-gray-900">${blog.tags?.join(', ') || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">SEO Keywords</label><p class="mt-1 text-gray-900">${blog.seo_keywords?.join(', ') || 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Allow Comments</label><p class="mt-1 text-gray-900">${blog.allow_comments ? 'Yes' : 'No'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Created At</label><p class="mt-1 text-gray-900">${blog.created_at ? new Date(blog.created_at).toLocaleString() : 'N/A'}</p></div>
                    <div><label class="block text-sm font-medium text-gray-700">Updated At</label><p class="mt-1 text-gray-900">${blog.updated_at ? new Date(blog.updated_at).toLocaleString() : 'N/A'}</p></div>
                </div>
            `);
        } catch (error) {
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast(`Failed to load blog details: ${error.message}`, 'error', 'top-right');
            }
            console.error('Blog details error:', error.message);
        }
    }

    // Show form to edit a blog post
    // Show form to edit a blog post
async showEditBlogForm(id) {
    try {
        const [blog, teamMembers] = await Promise.all([
            apiClient.get(`/blogs/${id}/`),
            apiClient.get('/team-members/')
        ]);
        const modal = this.createModal('Edit Blog Post', `
            <form id="edit-blog-form" class="space-y-4 max-h-[70vh] overflow-y-auto" enctype="multipart/form-data">
                <!-- Tab Navigation -->
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-2 sticky top-0 z-10">
                    <nav class="-mb-px flex space-x-4" aria-label="Tabs">
                        <button type="button" data-tab="basic-info" class="tab-button border-b-2 border-indigo-500 text-indigo-600 py-2 px-1 text-sm font-medium">Basic Info</button>
                        <button type="button" data-tab="details" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Details</button>
                        <button type="button" data-tab="links-image" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Links & Image</button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div id="basic-info" class="tab-content space-y-4 px-4">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="title" name="title" value="${blog.title}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="subtitle" class="block text-sm font-medium text-gray-700">Subtitle</label>
                        <input type="text" id="subtitle" name="subtitle" value="${blog.subtitle || ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="author_id" class="block text-sm font-medium text-gray-700">Author</label>
                        <select id="author_id" name="author_id" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">Select Author</option>
                            ${teamMembers.map(member => `<option value="${member.api_id}" ${blog.author_id === member.api_id ? 'selected' : ''}>${member.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" name="status" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="draft" ${blog.status === 'draft' ? 'selected' : ''}>Draft</option>
                            <option value="published" ${blog.status === 'published' ? 'selected' : ''}>Published</option>
                            <option value="archived" ${blog.status === 'archived' ? 'selected' : ''}>Archived</option>
                        </select>
                    </div>
                    <div>
                        <label for="language" class="block text-sm font-medium text-gray-700">Language</label>
                        <select id="language" name="language" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="en" ${blog.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="fr" ${blog.language === 'fr' ? 'selected' : ''}>French</option>
                        </select>
                    </div>
                </div>

                <div id="details" class="tab-content space-y-4 px-4 hidden">
                    <div>
                        <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
                        <textarea id="content" name="content" rows="6" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">${blog.content}</textarea>
                    </div>
                    <div>
                        <label for="excerpt" class="block text-sm font-medium text-gray-700">Excerpt</label>
                        <textarea id="excerpt" name="excerpt" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">${blog.excerpt || ''}</textarea>
                    </div>
                    <div>
                        <label for="read_time_minutes" class="block text-sm font-medium text-gray-700">Read Time (Minutes)</label>
                        <input type="number" id="read_time_minutes" name="read_time_minutes" min="1" value="${blog.read_time_minutes || ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="tags" class="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                        <input type="text" id="tags" name="tags" value="${blog.tags?.join(', ') || ''}" placeholder="e.g., AI, Tech" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="seo_keywords" class="block text-sm font-medium text-gray-700">SEO Keywords (comma-separated)</label>
                        <input type="text" id="seo_keywords" name="seo_keywords" value="${blog.seo_keywords?.join(', ') || ''}" placeholder="e.g., AI, Django" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="allow_comments" class="block text-sm font-medium text-gray-700">Allow Comments</label>
                        <input type="checkbox" id="allow_comments" name="allow_comments" ${blog.allow_comments ? 'checked' : ''} class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                    </div>
                </div>

                <div id="links-image" class="tab-content space-y-4 px-4 hidden">
                    <div>
                        <label for="published_date" class="block text-sm font-medium text-gray-700">Published Date</label>
                        <input type="datetime-local" id="published_date" name="published_date" value="${blog.published_date ? blog.published_date.slice(0, 16) : ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="featured_image" class="block text-sm font-medium text-gray-700">Featured Image</label>
                        <input type="file" id="featured_image" name="featured_image" accept="image/*" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <img id="image-preview" class="mt-2 ${blog.featured_image ? '' : 'hidden'} max-w-xs h-auto" src="${this.fixImageUrl(blog.featured_image)}" alt="Image Preview">
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="flex justify-between mt-4 px-4">
                    <button type="button" id="prev-tab" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 hidden">Previous</button>
                    <button type="button" id="next-tab" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Next</button>
                    <button type="submit" id="submit-blog" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 hidden">Update</button>
                </div>
            </form>
        `);

        // Tab switching logic
        const tabs = modal.querySelectorAll('.tab-button');
        const tabContents = modal.querySelectorAll('.tab-content');
        const prevBtn = modal.querySelector('#prev-tab');
        const nextBtn = modal.querySelector('#next-tab');
        const submitBtn = modal.querySelector('#submit-blog');
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

        // Add image preview
        const imageInput = modal.querySelector('#featured_image');
        const imagePreview = modal.querySelector('#image-preview');
        imageInput.addEventListener('change', () => {
            if (imageInput.files && imageInput.files[0]) {
                imagePreview.src = URL.createObjectURL(imageInput.files[0]);
                imagePreview.classList.remove('hidden');
            }
        });

        modal.querySelector('#edit-blog-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            formData.set('allow_comments', formData.get('allow_comments') === 'on' ? 'true' : 'false');
            const tags = formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean) : [];
            const seoKeywords = formData.get('seo_keywords') ? formData.get('seo_keywords').split(',').map(kw => kw.trim()).filter(Boolean) : [];
            formData.set('tags', JSON.stringify(tags));
            formData.set('seo_keywords', JSON.stringify(seoKeywords));

            try {
                const response = await fetch(`${this.baseUrl}/blogs/${id}/`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': apiClient.getHeaders()['Authorization']
                    },
                    body: formData
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(JSON.stringify(errorData) || `HTTP error! Status: ${response.status}`);
                }
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Blog post updated successfully', 'success', 'top-right');
                }
                modal.remove();
                this.loadBlogs();
            } catch (error) {
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast(`Failed to update blog post: ${error.message}`, 'error', 'top-right');
                }
                console.error('Edit blog error:', error.message);
            }
        });
    } catch (error) {
        if (typeof toastManager !== 'undefined') {
            toastManager.showToast(`Failed to load blog: ${error.message}`, 'error', 'top-right');
        }
        console.error('Edit blog error:', error.message);
    }
}

    // Delete a blog post
    async deleteBlog(id) {
        if (confirm('Are you sure you want to delete this blog post?')) {
            try {
                await apiClient.delete(`/blogs/${id}/`);
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Blog post deleted successfully', 'success', 'top-right');
                }
                this.loadBlogs();
            } catch (error) {
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast(`Failed to delete blog post: ${error.message}`, 'error', 'top-right');
                }
                console.error('Delete blog error:', error.message);
            }
        }
    }

    // Load all projects
    async loadProjects() {
        try {
            const projects = await apiClient.get('/projects/');
            const tbody = document.getElementById('projects-table');
            tbody.innerHTML = projects.length ? '' : `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No projects found</td></tr>`;

            projects.forEach(project => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${project.api_id || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${project.title}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${project.category || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${project.status || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button data-view="${project.api_id}" class="text-indigo-600 hover:text-indigo-900 mr-2">View</button>
                        <button data-edit="${project.api_id}" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                        <button data-delete="${project.api_id}" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            const loader = document.getElementById('page-loader');
            if (loader) loader.classList.add('hidden');

            document.getElementById('create-project-btn').addEventListener('click', () => this.showCreateProjectForm());
            tbody.querySelectorAll('[data-view]').forEach(btn => {
                btn.addEventListener('click', () => this.showProjectDetails(btn.getAttribute('data-view')));
            });
            tbody.querySelectorAll('[data-edit]').forEach(btn => {
                btn.addEventListener('click', () => this.showEditProjectForm(btn.getAttribute('data-edit')));
            });
            tbody.querySelectorAll('[data-delete]').forEach(btn => {
                btn.addEventListener('click', () => this.deleteProject(btn.getAttribute('data-delete')));
            });
        } catch (error) {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.innerHTML = `<p class="text-red-500">Failed to load projects: ${error.message}</p>`;
            }
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast(`Failed to load projects: ${error.message}`, 'error', 'top-right');
            }
            console.error('Projects error:', error.message);
        }
    }

    // Show form to create a project
      // Show form to create a new project
      async showCreateProjectForm() {
        try {
            const teamMembers = await apiClient.get('/team-members/');
            const modal = this.createModal('Create Project', `
                <form id="create-project-form" class="space-y-4 max-h-[70vh] overflow-y-auto" enctype="multipart/form-data">
                    <!-- Tab Navigation -->
                    <div class="border-b border-gray-200 bg-gray-50 px-4 py-2 sticky top-0 z-10">
                        <nav class="-mb-px flex space-x-4" aria-label="Tabs">
                            <button type="button" data-tab="basic-info" class="tab-button border-b-2 border-indigo-500 text-indigo-600 py-2 px-1 text-sm font-medium">Basic Info</button>
                            <button type="button" data-tab="details" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Details</button>
                            <button type="button" data-tab="links-image" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Links & Image</button>
                        </nav>
                    </div>

                    <!-- Tab Content -->
                    <div id="basic-info" class="tab-content space-y-4 px-4">
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="title" name="title" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                            <select id="category" name="category" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="software">Software Development</option>
                                <option value="ai">Artificial Intelligence</option>
                                <option value="web">Web Development</option>
                                <option value="mobile">Mobile Development</option>
                            </select>
                        </div>
                        <div>
                            <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" name="status" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="on_hold">On Hold</option>
                            </select>
                        </div>
                        <div>
                            <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" id="start_date" name="start_date" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
                            <input type="date" id="end_date" name="end_date" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                    </div>

                    <div id="details" class="tab-content space-y-4 px-4 hidden">
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" name="description" rows="6" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                        </div>
                        <div>
                            <label for="budget" class="block text-sm font-medium text-gray-700">Budget (XAF)</label>
                            <input type="number" id="budget" name="budget" step="0.01" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="technologies" class="block text-sm font-medium text-gray-700">Technologies (comma-separated)</label>
                            <input type="text" id="technologies" name="technologies" placeholder="e.g., Django, React" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="client" class="block text-sm font-medium text-gray-700">Client</label>
                            <input type="text" id="client" name="client" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="team_member_ids" class="block text-sm font-medium text-gray-700">Team Members</label>
                            <select id="team_member_ids" name="team_member_ids" multiple class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                ${teamMembers.map(member => `<option value="${member.api_id}">${member.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div id="links-image" class="tab-content space-y-4 px-4 hidden">
                        <div>
                            <label for="project_url" class="block text-sm font-medium text-gray-700">Project URL</label>
                            <input type="url" id="project_url" name="project_url" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="github_url" class="block text-sm font-medium text-gray-700">GitHub URL</label>
                            <input type="url" id="github_url" name="github_url" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="featured_image" class="block text-sm font-medium text-gray-700">Featured Image</label>
                            <input type="file" id="featured_image" name="featured_image" accept="image/*" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <img id="image-preview" class="mt-2 hidden max-w-xs h-auto" src="" alt="Image Preview">
                        </div>
                    </div>

                    <!-- Navigation Buttons -->
                    <div class="flex justify-between mt-4 px-4">
                        <button type="button" id="prev-tab" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 hidden">Previous</button>
                        <button type="button" id="next-tab" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Next</button>
                        <button type="submit" id="submit-project" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 hidden">Create</button>
                    </div>
                </form>
            `);

            // Tab switching logic
            const tabs = modal.querySelectorAll('.tab-button');
            const tabContents = modal.querySelectorAll('.tab-content');
            const prevBtn = modal.querySelector('#prev-tab');
            const nextBtn = modal.querySelector('#next-tab');
            const submitBtn = modal.querySelector('#submit-project');
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

            // Add image preview
            const imageInput = modal.querySelector('#featured_image');
            const imagePreview = modal.querySelector('#image-preview');
            imageInput.addEventListener('change', () => {
                if (imageInput.files && imageInput.files[0]) {
                    imagePreview.src = URL.createObjectURL(imageInput.files[0]);
                    imagePreview.classList.remove('hidden');
                }
            });

            modal.querySelector('#create-project-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const teamMemberIds = Array.from(modal.querySelector('#team_member_ids').selectedOptions).map(opt => parseInt(opt.value));
                const technologies = formData.get('technologies') ? formData.get('technologies').split(',').map(tech => tech.trim()).filter(Boolean) : [];
                formData.set('technologies', JSON.stringify(technologies));
                // Clear any existing team_member_ids to avoid duplicates
                formData.delete('team_member_ids');
                // Append each team_member_id individually
                teamMemberIds.forEach(id => formData.append('team_member_ids', id));

                try {
                    const response = await fetch(`${this.baseUrl}/projects/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': apiClient.getHeaders()['Authorization']
                        },
                        body: formData
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(JSON.stringify(errorData) || `HTTP error! Status: ${response.status}`);
                    }
                    if (typeof toastManager !== 'undefined') {
                        toastManager.showToast('Project created successfully', 'success', 'top-right');
                    }
                    modal.remove();
                    this.loadProjects();
                } catch (error) {
                    if (typeof toastManager !== 'undefined') {
                        toastManager.showToast(`Failed to create project: ${error.message}`, 'error', 'top-right');
                    }
                    console.error('Create project error:', error.message);
                }
            });
        } catch (error) {
            if (typeof toastManager !== 'undefined') {
                toastManager.showToast(`Failed to load team members: ${error.message}`, 'error', 'top-right');
            }
            console.error('Create project error:', error.message);
        }
    }
    
   // Show form to edit a project
   async showEditProjectForm(id) {
    try {
        const [project, teamMembers] = await Promise.all([
            apiClient.get(`/projects/${id}/`),
            apiClient.get('/team-members/')
        ]);
        const modal = this.createModal('Edit Project', `
            <form id="edit-project-form" class="space-y-4 max-h-[70vh] overflow-y-auto" enctype="multipart/form-data">
                <!-- Tab Navigation -->
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-2 sticky top-0 z-10">
                    <nav class="-mb-px flex space-x-4" aria-label="Tabs">
                        <button type="button" data-tab="basic-info" class="tab-button border-b-2 border-indigo-500 text-indigo-600 py-2 px-1 text-sm font-medium">Basic Info</button>
                        <button type="button" data-tab="details" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Details</button>
                        <button type="button" data-tab="links-image" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">Links & Image</button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div id="basic-info" class="tab-content space-y-4 px-4">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="title" name="title" value="${project.title}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category" name="category" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="Software Development" ${project.category === 'Software Development' ? 'selected' : ''}>Software Development</option>
                            <option value="AI" ${project.category === 'AI' ? 'selected' : ''}>AI</option>
                            <option value="Web Design" ${project.category === 'Web Design' ? 'selected' : ''}>Web Design</option>
                            <option value="Mobile App" ${project.category === 'Mobile App' ? 'selected' : ''}>Mobile App</option>
                        </select>
                    </div>
                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" name="status" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="planned" ${project.status === 'planned' ? 'selected' : ''}>Planned</option>
                            <option value="in_progress" ${project.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="on_hold" ${project.status === 'on_hold' ? 'selected' : ''}>On Hold</option>
                        </select>
                    </div>
                    <div>
                        <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" id="start_date" name="start_date" value="${project.start_date ? project.start_date.split('T')[0] : ''}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" id="end_date" name="end_date" value="${project.end_date ? project.end_date.split('T')[0] : ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                </div>

                <div id="details" class="tab-content space-y-4 px-4 hidden">
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" name="description" rows="6" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">${project.description}</textarea>
                    </div>
                    <div>
                        <label for="budget" class="block text-sm font-medium text-gray-700">Budget (XAF)</label>
                        <input type="number" id="budget" name="budget" step="0.01" value="${project.budget || ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="technologies" class="block text-sm font-medium text-gray-700">Technologies (comma-separated)</label>
                        <input type="text" id="technologies" name="technologies" value="${project.technologies?.join(', ') || ''}" placeholder="e.g., Django, React" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="client" class="block text-sm font-medium text-gray-700">Client</label>
                        <input type="text" id="client" name="client" value="${project.client || ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="team_member_ids" class="block text-sm font-medium text-gray-700">Team Members</label>
                        <select id="team_member_ids" name="team_member_ids" multiple class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            ${teamMembers.map(member => `<option value="${member.api_id}" ${project.team_member_ids.includes(member.api_id) ? 'selected' : ''}>${member.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div id="links-image" class="tab-content space-y-4 px-4 hidden">
                    <div>
                        <label for="project_url" class="block text-sm font-medium text-gray-700">Project URL</label>
                        <input type="url" id="project_url" name="project_url" value="${project.project_url || ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="github_url" class="block text-sm font-medium text-gray-700">GitHub URL</label>
                        <input type="url" id="github_url" name="github_url" value="${project.github_url || ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="featured_image" class="block text-sm font-medium text-gray-700">Featured Image</label>
                        <input type="file" id="featured_image" name="featured_image" accept="image/*" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <img id="image-preview" class="mt-2 ${project.featured_image ? '' : 'hidden'} max-w-xs h-auto" src="${this.fixImageUrl(project.featured_image)}" alt="Image Preview">
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="flex justify-between mt-4 px-4">
                    <button type="button" id="prev-tab" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 hidden">Previous</button>
                    <button type="button" id="next-tab" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Next</button>
                    <button type="submit" id="submit-project" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 hidden">Update</button>
                </div>
            </form>
        `);

        // Tab switching logic
        const tabs = modal.querySelectorAll('.tab-button');
        const tabContents = modal.querySelectorAll('.tab-content');
        const prevBtn = modal.querySelector('#prev-tab');
        const nextBtn = modal.querySelector('#next-tab');
        const submitBtn = modal.querySelector('#submit-project');
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

        // Add image preview
        const imageInput = modal.querySelector('#featured_image');
        const imagePreview = modal.querySelector('#image-preview');
        imageInput.addEventListener('change', () => {
            if (imageInput.files && imageInput.files[0]) {
                imagePreview.src = URL.createObjectURL(imageInput.files[0]);
                imagePreview.classList.remove('hidden');
            }
        });

        modal.querySelector('#edit-project-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const teamMemberIds = Array.from(modal.querySelector('#team_member_ids').selectedOptions).map(opt => parseInt(opt.value));
            formData.set('team_member_ids', JSON.stringify(teamMemberIds));
            formData.set('technologies', formData.get('technologies') ? formData.get('technologies').split(',').map(tech => tech.trim()) : []);

            try {
                const response = await fetch(`${this.baseUrl}/projects/${id}/`, {
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
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast('Project updated successfully', 'success', 'top-right');
                }
                modal.remove();
                this.loadProjects();
            } catch (error) {
                if (typeof toastManager !== 'undefined') {
                    toastManager.showToast(`Failed to update project: ${error.message}`, 'error', 'top-right');
                }
                console.error('Edit project error:', error.message);
            }
        });
    } catch (error) {
        if (typeof toastManager !== 'undefined') {
            toastManager.showToast(`Failed to load project: ${error.message}`, 'error', 'top-right');
        }
        console.error('Edit project error:', error.message);
    }
}

    // Create a modal for forms or details
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

const adminBlogProjectManager = new AdminBlogProjectManager();
window.adminBlogProjectManager = adminBlogProjectManager;