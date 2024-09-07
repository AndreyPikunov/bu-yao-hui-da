import React from 'react';
import { Box } from '@mui/material';

const TrajectoryVisualization = ({ trajectory }) => {

    if (!trajectory || trajectory.length !== 3) return null;

    const aspectRatio = 1; // Since your SVG is square
    const padding = 50;

    const getScaledCoordinates = (xValues, yValues) => {

        // trajectories are properly scaled in the backend
        const xMin = -1; // Math.min(...xValues);
        const xMax = 1; // Math.max(...xValues);
        const yMin = -1; // Math.min(...yValues);
        const yMax = 1; // Math.max(...yValues);

        const xScale = (400 - 2 * padding) / (xMax - xMin);
        const yScale = (400 - 2 * padding) / (yMax - yMin);

        return xValues.map((x, i) => [
            (x - xMin) * xScale + padding,
            400 - ((yValues[i] - yMin) * yScale + padding)
        ]);
    };

    const bodyColors = ['#D55E00', '#56B4E9', '#E69F00'];

    return (
        <Box
            display="flex"
            justifyContent="center"
            width="100%"
            sx={{
                height: 0,
                paddingTop: `${aspectRatio * 100}%`,
                position: 'relative'
            }}
        >
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
                viewBox={`0 0 ${400} ${400}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {trajectory.map((body, index) => {
                    const scaledPositions = getScaledCoordinates(body.x, body.y);
                    const pathData = scaledPositions.map((pos, i) =>
                        (i === 0 ? 'M' : 'L') + pos.join(',')
                    ).join(' ');

                    return (
                        <path
                            key={index}
                            d={pathData}
                            fill="none"
                            stroke={bodyColors[index]}
                            strokeWidth="2"
                        />
                    );
                })}
            </svg>
        </Box>
    );
};

export default TrajectoryVisualization;