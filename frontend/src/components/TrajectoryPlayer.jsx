import { useState, useEffect, useRef } from 'react';

function TrajectoryPlayer({ trajectory }) {
    const [audioContext, setAudioContext] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const sourceRef = useRef(null);

    useEffect(() => {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(context);

        return () => {
            if (context.state !== 'closed') {
                context.close();
            }
        };
    }, []);

    const playTrajectory = () => {
        if (!audioContext || !trajectory) return;

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
        }
        setIsPlaying(false);
    };

    const toggleTrajectory = () => {
        if (isPlaying) {
            stopTrajectory();
        } else {
            playTrajectory();
        }
    };

    return (
        <div>
            <button onClick={toggleTrajectory} disabled={!trajectory}>
                {isPlaying ? 'Stop Trajectory' : 'Play Trajectory'}
            </button>
        </div>
    );
}

export default TrajectoryPlayer;