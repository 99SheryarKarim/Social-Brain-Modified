import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

import styles from './PostGeniePage.module.css';
import IdeaTile from '../../components/idea-tile/IdeaTile';
import PrimaryButton from '../../components/primary-button/PrimaryButton.jsx';
import ModelSelector from '../../components/model-selector/ModelSelector.jsx';

import { generateSocialPost } from '../../features/posts/postsSlice';
import { fetchIdeas, updateIdea, clearIdeas } from '../../features/ideas/ideasSlice';
import { saveActivity } from '../../services/activityService';
import SendIdeaModal from '../../components/send-idea-modal/SendIdeaModal';
import { fetchTrendMatch } from '../../features/ideas/ideasAPI';

const PostGeniePage = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [prompt, setPrompt] = useState(() => {
        const initial = location.state?.prompt || (typeof window !== 'undefined' ? localStorage.getItem('pendingPrompt') : '');
        if (typeof window !== 'undefined') localStorage.removeItem('pendingPrompt');
        return initial || '';
    });
    const textareaRef = useRef(null);
    const dispatch = useDispatch();
    const recognitionRef = useRef(null);

    const { items: ideas, recommendations, loading, error, isMockData, dataSource, matchedTrend } = useSelector((state) => state.ideas);
    const [selectedModel, setSelectedModel] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ideaPulseModel') || 'gemini-2.5-flash';
        }
        return 'gemini-2.5-flash';
    });
    const lastNotificationRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceStatus, setVoiceStatus] = useState('Tap the mic to speak');
    const [useTrends, setUseTrends] = useState(false);
    const [trendPreview, setTrendPreview] = useState(null);

    useEffect(() => {
        if (!useTrends || !prompt.trim()) {
            setTrendPreview(null);
            return undefined;
        }
        fetchTrendMatch(prompt.trim()).then(setTrendPreview).catch(() => setTrendPreview(null));
        return undefined;
    }, [useTrends, prompt]);

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
                                <div className={styles.notificationIcon}><i className="fas fa-bolt" /></div>
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
                                <div className={styles.notificationIcon}><i className="fas fa-wand-magic-sparkles" /></div>
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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ideaPulseModel', selectedModel);
        }
    }, [selectedModel]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceStatus('Voice input is not supported in this browser.');
            return undefined;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceStatus('Listening... Speak now');
        };

        recognition.onresult = (event) => {
            const interimTranscript = Array.from(event.results)
                .filter((result) => !result.isFinal)
                .map((result) => result[0].transcript)
                .join(' ')
                .trim();

            const finalTranscript = Array.from(event.results)
                .filter((result) => result.isFinal)
                .map((result) => result[0].transcript)
                .join(' ')
                .trim();

            if (finalTranscript) {
                setPrompt(finalTranscript);
                setVoiceStatus('Voice captured. Sending your request...');
                handleGenerateIdeas(finalTranscript);
                recognition.stop();
            } else if (interimTranscript) {
                setPrompt(interimTranscript);
            }
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            setVoiceStatus(`Voice input error: ${event.error}`);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (!voiceStatus.includes('Sending')) {
                setVoiceStatus('Tap the mic to speak');
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const tones = ['Professional', 'Creative', 'Friendly', 'Casual', 'Witty', 'Sarcastic', 'Motivational', 'Empowering'];
    const [selectedTone, setSelectedTone] = useState('Creative');

    const providerColors = {
        custom: '#ccfbf1',
        'custom-sidecar': '#ccfbf1',
        'custom-huggingface': '#fef3c7',
        'gemini-fallback': '#dbeafe',
        gemini: '#dbeafe',
        huggingface: '#fef3c7',
        together: '#dcfce7',
        ollama: '#ede9fe',
    };

    const providerLabels = {
        custom: 'Idea Pulse AI (Fine-Tuned)',
        'custom-sidecar': 'Idea Pulse AI (Fine-Tuned)',
        'custom-huggingface': 'Idea Pulse AI (HF Endpoint)',
        'gemini-fallback': 'Google Gemini 2.5 Flash (Fallback)',
        gemini: 'Google Gemini 2.5 Flash',
        huggingface: 'Mistral 7B Instruct (HuggingFace)',
        together: 'Together.ai',
        ollama: 'LLaMA 2 (Local Ollama)',
    };

    const getProviderFromModel = (modelId) => {
        if (!modelId) return 'gemini';
        if (modelId === 'ideapulse-custom' || modelId === 'idea-pulse-custom-llm') return 'custom';
        if (modelId.startsWith('ollama-')) return 'ollama';
        if (modelId.includes('togethercomputer/')) return 'together';
        if (modelId.includes('mistralai/') || modelId.includes('meta-llama/')) return 'huggingface';
        return 'gemini';
    };

    const activeProviderKey = (dataSource && (dataSource in providerLabels || dataSource.startsWith('custom')))
        ? dataSource
        : getProviderFromModel(selectedModel);

    const activeProviderLabel = providerLabels[activeProviderKey] || providerLabels[getProviderFromModel(selectedModel)] || 'Idea Pulse AI (Fine-Tuned)';
    const providerBadgeStyle = {
        backgroundColor: providerColors[activeProviderKey] || '#ccfbf1',
        color: activeProviderKey.startsWith('custom') ? '#0f766e' : activeProviderKey.includes('gemini') ? '#1d4ed8' : activeProviderKey === 'huggingface' ? '#92400e' : activeProviderKey === 'together' ? '#166534' : '#5b21b6',
        fontWeight: '600',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
    };

    const resizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
        resizeTextarea();
    };

    const handleSelect = (tone) => {
        setSelectedTone(tone === selectedTone ? '' : tone);
    };

    const handleNewChat = () => {
        setPrompt('');
        setVoiceStatus('Tap the mic to speak');
        dispatch(clearIdeas());
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleVoiceToggle = () => {
        if (!recognitionRef.current) {
            setVoiceStatus('Voice input is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            return;
        }

        recognitionRef.current.start();
    };

    const postOptions = [1, 3, 5, 10, 15, 20];
    const [numPosts, setNumPosts] = useState(1);

    const words = [10, 20, 50, 100, 150, 200];
    const [numWords, setNumWords] = useState(10);


    // Get AI ideas
    const handleGenerateIdeas = (overridePrompt = prompt) => {
        const currentPrompt = (overridePrompt || '').trim();
        if (!currentPrompt) return;
        setPrompt(currentPrompt);
        dispatch(fetchIdeas({ prompt: currentPrompt, num: numPosts, tone: selectedTone, words: numWords, model: selectedModel, useTrends }))
          .then((result) => {
            if (result.error?.message?.startsWith('LIMIT_REACHED:')) {
              navigate('/upgrade');
            } else {
              saveActivity('ideas_generated', `Generated ideas for "${currentPrompt}"`, { prompt: currentPrompt, tone: selectedTone, numPosts });
            }
          });
    };

    console.log('Ideas from genei page:', ideas);

    const selectedIdeas = useSelector((state) => state.selectedIdeas);
    console.log('Selected ideas from genei page:', selectedIdeas);

    const getPostingRecommendation = (ideaText) => {
        const lower = (ideaText || '').toLowerCase();

        const isStartupOrLeadership =
            lower.includes('startup') ||
            lower.includes('tech lead') ||
            lower.includes('engineering manager') ||
            lower.includes('team productivity') ||
            lower.includes('workflow') ||
            lower.includes('productivity') ||
            lower.includes('team') ||
            lower.includes('leadership') ||
            lower.includes('business') ||
            lower.includes('founder');

        let platform = 'Instagram';
        if (isStartupOrLeadership || lower.includes('professional') || lower.includes('career') || lower.includes('business')) {
            platform = 'LinkedIn';
        } else if (lower.includes('tiktok') || lower.includes('short video') || lower.includes('viral')) {
            platform = 'TikTok';
        } else if (lower.includes('youtube') || lower.includes('video') || lower.includes('tutorial')) {
            platform = 'YouTube';
        } else if (lower.includes('twitter') || lower.includes('x.com') || lower.includes('trend')) {
            platform = 'X / Twitter';
        } else if (lower.includes('facebook') || lower.includes('community')) {
            platform = 'Facebook';
        }

        let time = 'Tue–Thu, 7:00–9:00 PM';
        let reason = 'Instagram is strongest for visual, lifestyle-driven ideas and tends to get more engagement in evening browsing windows.';

        if (platform === 'LinkedIn') {
            time = 'Tue–Thu, 8:00–10:00 AM';
            reason = 'LinkedIn performs best for leadership, startup, and product-focused posts during workday mornings when professionals are checking updates.';
        } else if (platform === 'TikTok') {
            time = 'Mon–Fri, 6:00–9:00 PM';
            reason = 'TikTok reaches the highest engagement for short-form, trend-driven content during early evening when users are scrolling for entertainment.';
        } else if (platform === 'YouTube') {
            time = 'Wed–Sat, 6:00–8:00 PM';
            reason = 'YouTube videos perform best in the evening because viewers are more likely to watch longer-form explanations and tutorials after work.';
        } else if (platform === 'X / Twitter') {
            time = 'Tue–Thu, 8:00–10:00 AM';
            reason = 'X is strongest for industry commentary, quick opinions, and trends during workday hours when conversations are active.';
        } else if (platform === 'Facebook') {
            time = 'Wed–Sat, 1:00–3:00 PM';
            reason = 'Facebook tends to perform best for community, events, and discussion-heavy content during lunch and afternoon browsing windows.';
        }

        return { platform, time, reason };
    };

    const [sendModalIdea, setSendModalIdea] = useState(null);

    const handleSendToFriend = (ideaText) => {
        if (!user?.token) {
            toast.error('Please sign in to send ideas to friends');
            navigate('/profile');
            return;
        }
        setSendModalIdea(ideaText);
    };

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
        <div className="app-page">
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold display-6 text-dark">Idea Pulse</h1>
                <p className="text-muted fs-5">Create a month’s worth of content in seconds!</p>
            </div>

            <div className={`mb-4 ${styles.composerWrapper}`}>
                <ModelSelector 
                    selectedModel={selectedModel}
                    onModelChange={(model) => setSelectedModel(model)}
                    disabled={loading}
                />
                <button type="button" className={styles.newChatBtn} onClick={handleNewChat}>
                    New Chat
                </button>
                <div className="position-relative w-100">
                    <textarea
                        rows="1"
                        ref={textareaRef}
                        value={prompt}
                        onInput={handleInputChange}
                        className={`form-control px-5 py-3 ${styles.textarea}`}
                        placeholder="Describe your content idea or speak into the mic..."
                    />
                    <button
                        type="button"
                        className={`position-absolute d-flex align-items-center justify-content-center ${styles.voiceBtn} ${isListening ? styles.voiceBtnListening : ''}`}
                        onClick={handleVoiceToggle}
                        aria-label="Voice input"
                    >
                        <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`} />
                    </button>
                    <button
                        type="button"
                        className={`position-absolute d-flex align-items-center gap-2 ${styles.generateBtn}`}
                        onClick={() => handleGenerateIdeas(prompt)}
                        disabled={!prompt.trim() || loading}
                    >
                        {loading ? (
                            <i className="fas fa-spinner fa-spin text-white" />
                        ) : (
                            <i className="fas fa-arrow-up text-white" />
                        )}
                    </button>
                </div>
                <div className={styles.modelStatusRow}>
                    {ideas && ideas.length > 0 && (
                        <span className={styles.modelStatusBadge} style={providerBadgeStyle}>
                            <i className="fas fa-microchip" /> Generated by: {activeProviderLabel}
                        </span>
                    )}
                    <span className={styles.voiceHint}>{voiceStatus}</span>
                </div>
                <label className="form-check form-switch mt-3 mb-0">
                    <input className="form-check-input" type="checkbox" checked={useTrends} onChange={(event) => setUseTrends(event.target.checked)} />
                    <span className="form-check-label">Use trending topics</span>
                </label>
                {useTrends && (matchedTrend || trendPreview) && (
                    <div className="alert alert-info mt-3 mb-0 py-2">
                        <strong>Matched trend:</strong> {(matchedTrend || trendPreview).trend.topic} ({Math.round((matchedTrend || trendPreview).relevanceScore * 100)}% relevant)<br />
                        <small>{(matchedTrend || trendPreview).reason}</small>
                    </div>
                )}
            </div>

            <section className="tone-selector mb-5">
                <div className="px-2 d-flex flex-column flex-md-row justify-content-between gap-3">
                    <div className="d-flex flex-wrap gap-2">
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
                    <div className="d-flex gap-2 flex-shrink-0">
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
            </section>

            <div>
                <h4 className="mb-4">Generated Ideas</h4>
                {loading && (
                    <div className="text-center py-4 d-flex justify-content-center align-items-center">
                        <div className="spinner-grow spinner-grow-sm" style={{ color: '#46a29f' }} role="status"></div>
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
                                    showSendToFriend={!!user}
                                    onSendToFriend={handleSendToFriend}
                                    recommendation={recommendations?.[index] || getPostingRecommendation(idea)}
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

        <SendIdeaModal
            isOpen={!!sendModalIdea}
            onClose={() => setSendModalIdea(null)}
            ideaText={sendModalIdea || ''}
        />
        </div>
    );
};

export default PostGeniePage;