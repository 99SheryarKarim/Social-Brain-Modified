import PostCard from '../../components/post-card/PostCard';
import { useSelector } from 'react-redux';
import { postToFacebookPage } from '../../services/post-to-fb';

const PostsPage = () => {
  const { posts, loading, error } = useSelector((state) => state.posts);


  const handlePostClick = (title,content) => {
    if (title && content) {
      postToFacebookPage(title, content);
      alert('Uploaded successfully!');
    } else {
      console.error("Title and message cannot be empty!");
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
              onEdit={() => alert('Edit clicked')}
              onUpload={() => handlePostClick(post.title, post.content)}
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
