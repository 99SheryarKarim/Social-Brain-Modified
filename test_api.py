import requests
import json

data = {
    'input': {
        'prompt': 'Create a funny social media post about AI',
        'num_posts': 1,
        'tone': 'humorous',
        'num_words': 50,
        'generate_image': False
    },
    'prompts': ['Write a hilarious post about AI taking over the world']
}

try:
    response = requests.post('http://localhost:8000/generate_posts_with_media', json=data, timeout=30)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print('✅ Success! Posts generated:')
        for post in result['posts']:
            print(f"Title: {post['title']}")
            print(f"Content: {post['content'][:100]}...")
            print(f"Hashtags: {post['hashtags']}")
    else:
        print(f'Error: {response.text[:300]}')
except Exception as e:
    print(f'Error: {e}')
