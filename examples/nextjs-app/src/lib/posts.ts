export async function fetchPosts() {
  try {
    const res = await fetch('https://api.example.com/posts', {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function fetchPostById(id: string) {
  try {
    const res = await fetch(`https://api.example.com/posts/${id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch post with id: ${id}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
}

export async function createPost(postData: { title: string; content: string; author: string }) {
  try {
    const res = await fetch('https://api.example.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!res.ok) {
      throw new Error('Failed to create post');
    }

    return res.json();
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export async function updatePost(id: string, postData: Partial<{ title: string; content: string }>) {
  try {
    const res = await fetch(`https://api.example.com/posts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!res.ok) {
      throw new Error(`Failed to update post with id: ${id}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error updating post ${id}:`, error);
    return null;
  }
}

export async function deletePost(id: string) {
  try {
    const res = await fetch(`https://api.example.com/posts/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete post with id: ${id}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    return false;
  }
}
