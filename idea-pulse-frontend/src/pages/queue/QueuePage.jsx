import { useState } from 'react';


const tones = [
  'Professional',
  'Creative',
  'Friendly',
  'Casual',
  'Witty',
  'Sarcastic',
  'Motivational',
  'Empowering',
];

const Queue = () => {
  const [selectedTone, setSelectedTone] = useState('');

  const handleSelect = (tone) => {
    setSelectedTone(tone === selectedTone ? '' : tone); // toggle off if clicked again
  };

  return (
    <div className="container py-4">
      <h4 className="mb-3">🎯 Select a Tone</h4>

      <div className="d-flex flex-row gap-2">
        {tones.map((tone) => (
          <button
            key={tone}
            className={`btn text-start ${
              selectedTone === tone ? 'btn-teal text-white' : 'btn-outline-secondary'
            }`}
            onClick={() => handleSelect(tone)}
          >
            {tone}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <h6>✅ Selected Tone:</h6>
        <p className="text-muted">{selectedTone || 'None selected'}</p>
      </div>
    </div>
  );
};

export default Queue;
