import { useState, useEffect, useRef } from 'react';
import TrajectoryLoader from './components/TrajectoryLoader';

function App() {
    const [trajectories, setTrajectories] = useState([]);
    const [audioContext, setAudioContext] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const sourceRef = useRef(null);

    useEffect(() => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(ctx);
        return () => {
            ctx.close();
        };
    }, []);

    const playTrajectory = () => {
        if (!audioContext || trajectories.length === 0) return;

        const trajectory = trajectories[2].data[2].y;
        const pitchFactor = 4; // Pitch up 4 times
        const bufferSize = Math.floor(trajectory.length / pitchFactor);
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const channel = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            // Linear interpolation for smoother pitch shifting
            const index = i * pitchFactor;
            const indexFloor = Math.floor(index);
            const indexCeil = Math.min(Math.ceil(index), trajectory.length - 1);
            const fraction = index - indexFloor;
            channel[i] = trajectory[indexFloor] * (1 - fraction) + trajectory[indexCeil] * fraction;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.loop = true;
        source.start();

        sourceRef.current = source;
        setIsPlaying(true);
    };

    const stopTrajectory = () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current = null;
            setIsPlaying(false);
        }
    };

    const toggleTrajectory = () => {
        if (isPlaying) {
            stopTrajectory();
        } else {
            playTrajectory();
        }
    };

    return (
        <div className="App">
            <h1>Trajectory Player</h1>
            <button onClick={toggleTrajectory} disabled={trajectories.length === 0}>
                {isPlaying ? 'Stop Trajectory' : 'Play Trajectory'}
            </button>
            <h1>Trajectory Loader</h1>
            <TrajectoryLoader setTrajectories={setTrajectories} />
            {/* Rest of your app components */}
        </div>
    );
}

export default App;