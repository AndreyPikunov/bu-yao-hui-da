import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

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

        source.onended = () => {
            setIsPlaying(false);
        };
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <IconButton
                onClick={toggleTrajectory}
                disabled={!trajectory}
                color="primary"
                size="large"
            >
                {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
            </IconButton>
        </Box>
    );
}

export default TrajectoryPlayer;