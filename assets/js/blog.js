document.addEventListener('DOMContentLoaded', async () => {
    const blogContainer = document.getElementById('blog-container');
    const preloader = document.getElementById('preloader');

    if (!blogContainer) {
        console.error('Blog container not found');
        return;
    }

    try {
        // Fetch published blogs
        const blogs = await window.apiClient.getPublishedBlogs();

        if (blogs.length === 0) {
            blogContainer.innerHTML = '<p>No published blogs available at the moment.</p>';
            if (preloader) preloader.style.display = 'none';
            return;
        }

        // Clear existing content
        blogContainer.innerHTML = '';

        // Render each blog
        blogs.forEach((blog, index) => {
            const delay = 100 * (index + 1); // Incremental delay for AOS animation
            const blogCard = document.createElement('div');
            blogCard.className = 'col-md-4 mb-4';
            blogCard.setAttribute('data-aos', 'zoom-in');
            blogCard.setAttribute('data-aos-delay', delay);

            // Use featured_image or fallback to placeholder
            const imageUrl = blog.featured_image || `https://picsum.photos/400/200?random=${blog.api_id}`;
            const excerpt = blog.excerpt || 'No summary available.';
            const truncatedExcerpt = excerpt.length > 50 ? excerpt.substring(0, 50) + '...' : excerpt;
            const tags = blog.tags && blog.tags.length > 0 ? blog.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('') : '<span class="badge bg-secondary">No tags</span>';

            blogCard.innerHTML = `
                <div class="card cards h-100 shadow-sm" style="width: 400px;">
                    <img src="${imageUrl}" class="card-img-top" alt="${blog.title}" style="width: 400px; height: 200px; object-fit: cover;" />
                    <div class="card-body" style="width: 400px;">
                        <h5 class="card-title">${blog.title}</h5>
                        <p class="card-text">${truncatedExcerpt}</p>
                        <div class="blog-tags mb-2">${tags}</div>
                        <a href="blog_detail.html?id=${blog.api_id}" class="btn btn-primary">Read more</a>
                    </div>
                </div>
            `;

            blogContainer.appendChild(blogCard);
        });

        // Hide preloader
        if (preloader) preloader.style.display = 'none';
    } catch (error) {
        console.error('Error loading blogs:', error);
        blogContainer.innerHTML = '<p>Failed to load blogs. Please try again later.</p>';
        if (preloader) preloader.style.display = 'none';
    }
});