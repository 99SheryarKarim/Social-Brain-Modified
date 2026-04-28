import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchLibrary, deletePost } from '../../features/posts/postsSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import PostCard from '../../components/post-card/PostCard';
import styles from './PostsPage.module.css';

const BASE = 'http://localhost:3001/api/facebook';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const PostsPage = ({ user }) => {
  const dispatch = useDispatch();
  const { posts, library, loading, libraryLoading } = useSelector((state) => state.posts);
  const [activeTab, setActiveTab] = useState('generated');
  const [publishing, setPublishing] = useState(null);

  // Load library from DB on mount if logged in
  useEffect(() => {
    if (user) dispatch(fetchLibrary());
  }, [user]);

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

  const handleDelete = (postId) => {
    dispatch(deletePost(postId));
    showSuccessToast('Post deleted');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="container py-5">
      <div className="mb-4 text-center">
        <h2 className="fw-bold">📚 My Posts</h2>
        <p className="text-muted">Your generated content library</p>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 justify-content-center">
        <button
          className={`btn rounded-pill px-4 ${activeTab === 'generated' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('generated')}
        >
          ✨ Just Generated {posts.length > 0 && <span className="badge bg-primary ms-1">{posts.length}</span>}
        </button>
        <button
          className={`btn rounded-pill px-4 ${activeTab === 'library' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('library')}
        >
          🗂️ Archive {library.length > 0 && <span className="badge bg-secondary ms-1">{library.length}</span>}
        </button>
      </div>

      {/* Generated Posts Tab */}
      {activeTab === 'generated' && (
        <>
          {loading && <p className="text-center text-muted">⏳ Generating posts...</p>}
          {posts.length === 0 && !loading && (
            <div className="text-center py-5">
              <i className="fas fa-magic-wand-sparkles fs-1 text-muted mb-3" />
              <p className="text-muted">No posts generated yet. Go to Post Genie to create some!</p>
            </div>
          )}
          <div className="row">
            {posts.map((post, index) => (
              <PostCard key={index} post={post} number={index + 1}
                onEdit={() => {}} onUpload={() => handleUpload(post, index)}
                uploading={publishing === index} />
            ))}
          </div>
        </>
      )}

      {/* Library Tab */}
      {activeTab === 'library' && (
        <>
          {!user && (
            <div className="text-center py-5">
              <i className="fas fa-lock fs-1 text-muted mb-3" />
              <p className="text-muted">Please log in to view your post archive</p>
            </div>
          )}
          {user && libraryLoading && <p className="text-center text-muted">⏳ Loading archive...</p>}
          {user && !libraryLoading && library.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-inbox fs-1 text-muted mb-3" />
              <p className="text-muted">No saved posts yet. Generate some posts to build your archive!</p>
            </div>
          )}
          {user && !libraryLoading && library.length > 0 && (
            <div className="row g-4">
              {library.map((post) => (
                <div key={post.id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    {/* Image */}
                    <LibraryImage post={post} />
                    <div className="card-body d-flex flex-column">
                      {/* Badges */}
                      <div className="d-flex gap-2 mb-2 flex-wrap">
                        {post.tone && <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary">{post.tone}</span>}
                        {post.original_topic && <span className="badge rounded-pill bg-light text-dark">{post.original_topic}</span>}
                        {post.posted_to_facebook && <span className="badge rounded-pill bg-success">✓ Published</span>}
                      </div>
                      {/* Content */}
                      <p className="text-muted small flex-grow-1" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                        {post.content}
                      </p>
                      {post.hashtags && <p className="text-primary small">{post.hashtags}</p>}
                      <p className="text-muted" style={{ fontSize: 11 }}>{formatDate(post.created_at)}</p>
                      {/* Actions */}
                      <div className="d-flex gap-2 mt-2">
                        <button className="btn btn-sm btn-dark rounded-pill flex-grow-1"
                          onClick={() => handleUpload(post, `lib-${post.id}`)}
                          disabled={publishing === `lib-${post.id}`}>
                          {publishing === `lib-${post.id}` ? <><i className="fas fa-spinner fa-spin me-1" />Publishing...</> : '🚀 Publish'}
                        </button>
                        <button className="btn btn-sm btn-outline-danger rounded-pill"
                          onClick={() => handleDelete(post.id)}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Separate component to handle Pexels image fetch for library cards
const LibraryImage = ({ post }) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const query = post.original_topic || post.image_prompt || 'social media';
    const tone = post.tone || '';
    const searchQuery = tone ? `${query} ${tone}` : query;
    const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1`, {
      headers: { Authorization: apiKey }
    })
      .then(r => r.json())
      .then(data => {
        if (data.photos?.length > 0) setImgSrc(data.photos[0].src.landscape);
        else setImgSrc(`https://picsum.photos/seed/${encodeURIComponent(query)}/400/200`);
      })
      .catch(() => setImgSrc('https://picsum.photos/400/200'));
  }, [post.original_topic, post.image_prompt, post.tone]);

  return (
    <img src={imgSrc || 'https://picsum.photos/400/200'} alt={post.original_topic || 'post'}
      className="card-img-top rounded-top-4"
      style={{ height: 180, objectFit: 'cover' }}
      onError={() => setImgSrc('https://picsum.photos/400/200')} />
  );
};

export default PostsPage;
