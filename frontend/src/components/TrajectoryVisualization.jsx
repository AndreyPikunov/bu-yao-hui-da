import React from 'react';

const TrajectoryVisualization = ({ trajectory }) => {

    if (!trajectory || trajectory.length !== 3) return null;

    const svgWidth = 400;
    const svgHeight = 400;
    const padding = 50;

    const getScaledCoordinates = (xValues, yValues) => {

        // trajectories are properly scaled in the backend
        const xMin = -1; // Math.min(...xValues);
        const xMax = 1; // Math.max(...xValues);
        const yMin = -1; // Math.min(...yValues);
        const yMax = 1; // Math.max(...yValues);

        const xScale = (svgWidth - 2 * padding) / (xMax - xMin);
        const yScale = (svgHeight - 2 * padding) / (yMax - yMin);

        return xValues.map((x, i) => [
            (x - xMin) * xScale + padding,
            svgHeight - ((yValues[i] - yMin) * yScale + padding)
        ]);
    };

    const bodyColors = ['#D55E00', '#56B4E9', '#E69F00'];

    return (
        <svg width={svgWidth} height={svgHeight}>
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
    );
};

export default TrajectoryVisualization;