import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import styles from './PostGeniePage.module.css';
import IdeaTile from '../../components/idea-tile/IdeaTile';
import PrimaryButton from '../../components/primary-button/PrimaryButton.jsx';

import { generateSocialPost } from '../../features/posts/postsSlice';
import { fetchIdeas, updateIdea } from '../../features/ideas/ideasSlice';
import { saveActivity } from '../../services/activityService';

const PostGeniePage = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const textareaRef = useRef(null);
    const dispatch = useDispatch();

    const { items: ideas, loading, error, isMockData, dataSource } = useSelector((state) => state.ideas);
    const lastNotificationRef = useRef(null);

    // Show notification when ideas are generated
    useEffect(() => {
        if (ideas && ideas.length > 0) {
            // Avoid duplicate toasts
            if (lastNotificationRef.current !== ideas.length) {
                lastNotificationRef.current = ideas.length;
                
                if (isMockData) {
                    toast.custom((t) => (
                        <div className={`${styles.notification} ${styles.notificationMock} ${t.visible ? styles.show : ''}`}>
                            <button 
                                className={styles.closeBtn}
                                onClick={() => toast.dismiss(t.id)}
                                aria-label="Close notification"
                            >
                                ✕
                            </button>
                            <div className={styles.notificationContent}>
                                <div className={styles.notificationIcon}>⚡</div>
                                <div className={styles.notificationText}>
                                    <p className={styles.notificationTitle}>Demo Data</p>
                                    <p className={styles.notificationSubtitle}>
                                        {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'} generated using sample data
                                    </p>
                                </div>
                            </div>
                        </div>
                    ), { duration: 5000 });
                } else {
                    toast.custom((t) => (
                        <div className={`${styles.notification} ${styles.notificationSuccess} ${t.visible ? styles.show : ''}`}>
                            <button 
                                className={styles.closeBtn}
                                onClick={() => toast.dismiss(t.id)}
                                aria-label="Close notification"
                            >
                                ✕
                            </button>
                            <div className={styles.notificationContent}>
                                <div className={styles.notificationIcon}>✨</div>
                                <div className={styles.notificationText}>
                                    <p className={styles.notificationTitle}>Ideas Generated!</p>
                                    <p className={styles.notificationSubtitle}>
                                        {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'} from AI
                                    </p>
                                </div>
                            </div>
                        </div>
                    ), { duration: 5000 });
                }
            }
        }
    }, [ideas, isMockData]);

    const tones = ['Professional', 'Creative', 'Friendly', 'Casual', 'Witty', 'Sarcastic', 'Motivational', 'Empowering'];
    const [selectedTone, setSelectedTone] = useState('Creative');

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleSelect = (tone) => {
        setSelectedTone(tone === selectedTone ? '' : tone);
    };

    const postOptions = [1, 3, 5, 10, 15, 20];
    const [numPosts, setNumPosts] = useState(1);

    const words = [10, 20, 50, 100, 150, 200];
    const [numWords, setNumWords] = useState(10);


    // Get AI ideas
    const handleGenerateIdeas = () => {
        if (!prompt.trim()) return;
        dispatch(fetchIdeas({ prompt, num: numPosts, tone: selectedTone, words: numWords }));
        saveActivity('ideas_generated', `Generated ideas for "${prompt}"`, { prompt, tone: selectedTone, numPosts });
    };

    console.log('Ideas from genei page:', ideas);

    const selectedIdeas = useSelector((state) => state.selectedIdeas);
    console.log('Selected ideas from genei page:', selectedIdeas);




    const handleGeneratePosts = async () => {
        if (!selectedIdeas || selectedIdeas.length === 0) {
            alert('Please select at least one idea.');
            return;
        }
        const result = await dispatch(generateSocialPost({
            input: {
                prompt,
                num_posts: selectedIdeas.length,
                tone: selectedTone,
                num_words: numWords,
                generate_image: false
            },
            selectedIdeas: selectedIdeas
        }));
        if (result.type === 'socialPosts/generateSocialPost/fulfilled') {
            saveActivity('posts_generated', `Generated ${selectedIdeas.length} post(s) for "${prompt}"`, { prompt, tone: selectedTone, count: selectedIdeas.length });
            navigate('/posts');
        }
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold display-6 text-dark">🧞‍♂️ Post Genie</h1>
                <p className="text-muted fs-5">Create a month’s worth of content in seconds!</p>
            </div>

            <div className="mb-4">
                <div className="position-relative w-100">
                    <textarea
                        rows="1"
                        ref={textareaRef}
                        value={prompt}
                        onInput={handleInputChange}
                        className={`form-control px-5 py-3 ${styles.textarea}`}
                        placeholder="Type your prompt here for idea generation..."
                    />
                    <button
                        className={`btn btn-dark position-absolute d-flex align-items-center gap-2 ${styles.generateBtn}`}
                        onClick={handleGenerateIdeas}
                        disabled={!prompt.trim() || loading}
                    >
                        {loading ? (
                            <i className="fas fa-spinner fa-spin text-white" />
                        ) : (
                            <i className="fas fa-arrow-up text-white" />
                        )}
                    </button>
                </div>
            </div>

            <section className="tone-selector mb-5">
                <div className="px-2 d-flex justify-content-between">
                    <div className="d-flex flex-row gap-2">
                        {tones.map((tone) => (
                            <button
                                key={tone}
                                className={`btn rounded-pill px-3 py-2 ${styles.toneBtn} ${selectedTone === tone ? styles.selected : ''}`}
                                onClick={() => handleSelect(tone)}
                            >
                                {tone}
                            </button>
                        ))}
                    </div>
                    <div className="d-flex justify-content-center">
                        <div className="body d-flex gap-2">
                            <div className="dropdown">
                                <button
                                    className={`btn ${styles.toneBtn} px-3 py-2 dropdown-toggle rounded-pill`}
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {numWords} Words
                                </button>
                                <ul className="dropdown-menu rounded pt-2">
                                    {words.map((num) => (
                                        <li key={num}>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => setNumWords(num)}
                                            >
                                                {num} Words
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="dropdown">
                                <button
                                    className={`btn ${styles.toneBtn} px-3 py-2 dropdown-toggle rounded-pill`}
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {numPosts} Posts
                                </button>
                                <ul className="dropdown-menu rounded pt-2">
                                    {postOptions.map((num) => (
                                        <li key={num}>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => setNumPosts(num)}
                                            >
                                                {num} Posts
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div>
                <h4 className="mb-4">✨ Generated Ideas</h4>
                {loading && (
                    <div className="text-center py-4 d-flex justify-content-center align-items-center">
                        <div className="spinner-grow spinner-grow-sm text-dark" role="status"></div>
                        <p className="ps-2 mb-0 text-muted">AI is crafting your content ideas...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        <div>{error}</div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="d-flex flex-column gap-3">
                        {ideas.length > 0 ? (
                            ideas.map((idea, index) => (
                                <IdeaTile
                                    key={index}
                                    text={idea}
                                    number={index + 1}
                                    onEdit={(newText) => dispatch(updateIdea({ index, newText }))}
                                />
                            ))
                        ) : (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                                <p className="text-muted text-center">Your AI-generated ideas will appear here. Enter a prompt to get started!</p>
                            </div>
                        )}

                        {ideas.length > 0 && (
                            <div className="text-center mt-4">
                                <PrimaryButton
                                    className="rounded-pill"
                                    onClick={handleGeneratePosts}>
                                    Generate Posts
                                </PrimaryButton>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostGeniePage;