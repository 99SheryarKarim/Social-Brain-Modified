# YouTube OAuth

YouTube uses the Google OAuth client configured through environment variables. Keep the client secret out of source control:

```env
YOUTUBE_CLIENT_ID=your-google-client-id
YOUTUBE_CLIENT_SECRET=your-google-client-secret
YOUTUBE_CALLBACK_URL=http://localhost:1000/api/youtube/callback
```

Add the callback URL to Google Cloud Console under **APIs & Services > Credentials > OAuth 2.0 Client IDs**, enable the YouTube Data API v3, and configure the OAuth consent screen. The application requests `youtube.readonly` for connection status; publishing/upload permissions are not requested.
