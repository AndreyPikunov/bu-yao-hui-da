import { useState, useEffect, useRef } from 'react';
import TrajectoryLoader from './components/TrajectoryLoader';

function App() {
    const [trajectories, setTrajectories] = useState([]);
    const [audioContext, setAudioContext] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedTrajectoryIndex, setSelectedTrajectoryIndex] = useState(0);
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

        const trajectory = trajectories[selectedTrajectoryIndex].data;
        const bufferSize = trajectory[0].x.length;
        const buffer = audioContext.createBuffer(6, bufferSize, audioContext.sampleRate);

        trajectory.forEach((body, bodyIndex) => {
            ['x', 'y'].forEach((component, componentIndex) => {
                const channel = buffer.getChannelData(bodyIndex * 2 + componentIndex);
                for (let i = 0; i < bufferSize; i++) {
                    channel[i] = body[component][i];
                }
            });
        });

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

    const handleTrajectorySelection = (event) => {
        setSelectedTrajectoryIndex(Number(event.target.value));
    };

    return (
        <div className="App">
            <h1>Trajectory Player</h1>
            <select 
                value={selectedTrajectoryIndex} 
                onChange={handleTrajectorySelection}
                disabled={trajectories.length === 0}
            >
                {trajectories.map((_, index) => (
                    <option key={index} value={index}>
                        {trajectories[index].name}
                    </option>
                ))}
            </select>
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