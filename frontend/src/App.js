import React, { useEffect, useState } from 'react';

function App() {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const res = await fetch('/time');
        const data = await res.json();
        setDisplayTime(data.time);
      } catch (err) {
        console.error('Error fetching time:', err);
      }
    };

    fetchTime();
    const interval = setInterval(fetchTime, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontSize: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%', height: '90vh' }}>
      <h1>{displayTime}</h1>
    </div>
  );
}

export default App;
