import { useEffect, useRef } from "react";
import SocialCard from "../../components/social-card/SocialCard";
import styles from './ConnectSocial.module.css';

const ConnectSocial = () => {
    const fbReady = useRef(false);

    // Load Facebook SDK
    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: '659023470326286', // 🔁 Replace this with your actual Facebook App ID
                cookie: true,
                xfbml: true,
                version: 'v19.0',
            });
            fbReady.current = true;
        };

        (function (d, s, id) {
            if (d.getElementById(id)) return;
            const js = d.createElement(s);
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            const fjs = d.getElementsByTagName(s)[0];
            fjs.parentNode.insertBefore(js, fjs);
        })(document, "script", "facebook-jssdk");
    }, []);

    const handleFacebookLogin = () => {
        if (!fbReady.current || !window.FB) {
            alert("Facebook SDK not ready yet. Please try again in a moment.");
            return;
        }

        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            alert("Facebook Login only works over HTTPS or localhost in development.");
            return;
        }

        window.FB.login((response) => {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken;
                console.log("✅ FB Access Token:", accessToken);
                fetchFacebookPages(accessToken);
            } else {
                console.log("User cancelled login.");
            }
        }, { scope: 'pages_show_list,pages_read_engagement' });
    };

    const fetchFacebookPages = (token) => {
        window.FB.api('/me/accounts', function (response) {
            console.log('Facebook Pages:', response,token);
        });
    };

    const platforms = [
        { name: "Facebook", connected: true, logo: "https://cdn-icons-png.flaticon.com/512/733/733547.png" },
        { name: "Instagram", connected: false, logo: "https://cdn-icons-png.flaticon.com/512/174/174855.png" },
        { name: "Pinterest", connected: false, logo: "https://cdn-icons-png.flaticon.com/512/145/145808.png" },
        { name: "Google", connected: false, logo: "https://cdn-icons-png.flaticon.com/512/300/300221.png" },
        { name: "LinkedIn", connected: false, logo: "https://cdn-icons-png.flaticon.com/512/174/174857.png" },
        { name: "Twitter", connected: false, logo: "https://cdn-icons-png.flaticon.com/512/733/733579.png" },
        { name: "YouTube", connected: false, logo: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png" },
        { name: "Reddit", connected: false, logo: "https://cdn-icons-png.flaticon.com/512/2111/2111589.png" },
    ];

    return (
        <div className={styles.wrapper}>
            <div className="container py-5">
                <h2 className={`text-center mb-4 ${styles.heading}`}>Connect Your Social Media</h2>
                <p className="text-center text-muted mb-5">Choose a platform to link for post automation</p>
                <div className={styles.cardGrid}>
                    {platforms.map((p) => (
                        <SocialCard
                            key={p.name}
                            platform={p.name}
                            logo={p.logo}
                            connected={p.connected}
                            onClick={() =>
                                p.name === "Facebook"
                                    ? handleFacebookLogin()
                                    : console.log(`Connect to ${p.name}`)
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConnectSocial;
