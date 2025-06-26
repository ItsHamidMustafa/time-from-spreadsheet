import React, { useEffect, useState } from 'react';

function App() {
  const [displayTime, setDisplayTime] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [isPastDue, setIsPastDue] = useState(false);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const res = await fetch('/time');
        const data = await res.json();

        setDisplayTime(data.time);
        setDueTime(data.dueTime);

        if (data.dueTime) {
          const now = new Date();

          // Parse "01:00:00 PM" safely
          const parseDueTime = (timeStr) => {
            const [time, meridian] = timeStr.split(' ');
            let [hours, minutes, seconds] = time.split(':').map(Number);

            if (meridian === 'PM' && hours !== 12) hours += 12;
            if (meridian === 'AM' && hours === 12) hours = 0;

            const due = new Date();
            due.setHours(hours, minutes, seconds, 0);
            return due;
          };

          const due = parseDueTime(data.dueTime);

          setIsPastDue(now > due);
        }
      } catch (err) {
        console.error('Error fetching time:', err);
      }
    };

    fetchTime();
    const interval = setInterval(fetchTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1>Assign by time:</h1>
      <span style={isPastDue ? {color: '#4BB543'} : {color:'red'}}>
        {displayTime}
        {console.log(dueTime)}
      </span>
    </>
  );
}

export default App;
