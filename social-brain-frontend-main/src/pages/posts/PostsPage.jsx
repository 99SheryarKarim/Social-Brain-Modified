import { useState } from 'react';
import PostCard from '../../components/post-card/PostCard';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const BASE = 'http://localhost:3001/api/facebook';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const PostsPage = () => {
  const { posts, loading, error } = useSelector((state) => state.posts);
  const [publishing, setPublishing] = useState(null); // index of post being published

  const handleUpload = async (post, index) => {
    if (!localStorage.getItem('token')) {
      showErrorToast('Please log in to publish posts');
      return;
    }

    setPublishing(index);
    try {
      await axios.post(`${BASE}/post`, {
        content: post.content,
        imageUrl: post.imageUrl || null,
        hashtags: post.hashtags || '',
      }, { headers: getHeaders() });

      showSuccessToast('🚀 Post published to Facebook!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish';
      if (msg.includes('No Facebook page connected')) {
        showErrorToast('Please connect your Facebook page first in Connect Social');
      } else {
        showErrorToast(msg);
      }
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-5 text-center">
        <h2 className="fw-bold">Generated Posts</h2>
        <hr className="header-sep mx-auto" />
      </div>

      {loading && <p className="text-center text-muted">⏳ Generating posts...</p>}
      {error && <p className="text-center text-danger">❌ {error}</p>}

      <div className="row">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <PostCard
              key={index}
              post={post}
              number={index + 1}
              onEdit={() => showErrorToast('Edit coming soon')}
              onUpload={() => handleUpload(post, index)}
              uploading={publishing === index}
            />
          ))
        ) : (
          !loading && !error && (
            <p className="text-center text-muted">No posts to display.</p>
          )
        )}
      </div>
    </div>
  );
};

export default PostsPage;
