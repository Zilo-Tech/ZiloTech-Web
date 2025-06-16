document.addEventListener('DOMContentLoaded', async () => {
    const blogContent = document.getElementById('blog-content');
    const authorName = document.getElementById('author-name');
    const publishedDate = document.getElementById('published-date');
    const readTime = document.getElementById('read-time');
    const featuredImage = document.getElementById('featured-image');
    const blogBody = document.getElementById('blog-body');
    const seoKeywords = document.getElementById('seo-keywords');
    const authorInfo = document.getElementById('author-info');
    const recommendedContainer = document.getElementById('recommended-container');
    const preloader = document.getElementById('preloader');

    // Get api_id from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const apiId = parseInt(urlParams.get('id'));

    if (!apiId) {
        blogContent.innerHTML = '<h1>Error</h1><p>No blog ID provided.</p>';
        if (preloader) preloader.style.display = 'none';
        return;
    }

    try {
        // Fetch blog details
        const blog = await window.apiClient.getBlogById(apiId);

        // Update blog content
        blogContent.querySelector('h1').textContent = blog.title;
        authorName.textContent = blog.author?.name || 'Unknown Author';
        publishedDate.textContent = blog.published_date
            ? new Date(blog.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        readTime.textContent = `${blog.read_time_minutes} min read`;
        featuredImage.src = blog.featured_image || `https://picsum.photos/400/200?random=${blog.api_id}`;
        featuredImage.alt = blog.title;
        featuredImage.style.width = '400px';
        featuredImage.style.height = '200px';
        featuredImage.style.objectFit = 'cover';
        blogBody.innerHTML = blog.content || '<p>No content available.</p>';

        // Update SEO keywords
        const keywords = blog.seo_keywords && blog.seo_keywords.length > 0
            ? blog.seo_keywords.map(keyword => `<span class="badge bg-primary me-1">${keyword}</span>`).join('')
            : '<span class="badge bg-primary">No keywords</span>';
        seoKeywords.innerHTML = `<strong>Keywords:</strong> ${keywords}`;

        // Update author info
        authorInfo.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${blog.author?.profile_picture || 'https://picsum.photos/100/100'}" alt="${blog.author?.name || 'Author'}" class="rounded-circle me-3" style="width: 60px; height: 60px;">
                <div>
                    <h5>${blog.author?.name || 'Unknown Author'}</h5>
                    <p>${blog.author?.bio || 'No bio available.'}</p>
                </div>
            </div>
        `;

        // Fetch and render recommended blogs
        const recommendedBlogs = await window.apiClient.getRecommendedBlogs(apiId);
        if (recommendedBlogs.length === 0) {
            recommendedContainer.innerHTML = '<p>No recommended blogs available.</p>';
        } else {
            recommendedContainer.innerHTML = '';
            recommendedBlogs.forEach((recBlog, index) => {
                const delay = 100 * (index + 1);
                const recCard = document.createElement('div');
                recCard.className = 'col-md-3 mb-4';
                recCard.setAttribute('data-aos', 'zoom-in');
                recCard.setAttribute('data-aos-delay', delay);

                const imageUrl = recBlog.featured_image || `https://picsum.photos/400/200?random=${recBlog.api_id}`;
                const excerpt = recBlog.content ? recBlog.content.slice(0, 50) + (recBlog.content.length > 50 ? '...' : '') : 'No summary available.';
                const tags = recBlog.tags && recBlog.tags.length > 0 ? recBlog.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('') : '<span class="badge bg-secondary">No tags</span>';

                recCard.innerHTML = `
                    <div class="card cards h-100 shadow-sm" style="width: 400px;">
                        <img src="${imageUrl}" class="card-img-top" alt="${recBlog.title}" style="width: 400px; height: 200px; object-fit: cover;" />
                        <div class="card-body" style="width: 400px;">
                            <h6 class="card-title">${recBlog.title}</h6>
                            <p class="card-text">${excerpt}</p>
                            <div class="blog-tags mb-2">${tags}</div>
                            <a href="blog_detail.html?id=${recBlog.api_id}" class="btn btn-primary btn-sm">Read more</a>
                        </div>
                    </div>
                `;

                recommendedContainer.appendChild(recCard);
            });
        }

        // Hide preloader
        if (preloader) preloader.style.display = 'none';
    } catch (error) {
        console.error('Error loading blog details:', error);
        blogContent.innerHTML = '<h1>Error</h1><p>Failed to load blog. Please try again later.</p>';
        recommendedContainer.innerHTML = '';
        if (preloader) preloader.style.display = 'none';
    }
});