import React from 'react';

const TrajectoryTimeVisualization = ({ trajectory }) => {
    if (!trajectory || trajectory.length !== 3) return null;

    const svgWidth = 800;
    const svgHeight = 400;
    const padding = 50;

    const getScaledCoordinates = (values) => {
        const tMin = 0;
        const tMax = values.length - 1;
        const valMin = -1;
        const valMax = 1;

        const tScale = (svgWidth - 2 * padding) / (tMax - tMin);
        const valScale = (svgHeight - 2 * padding) / (valMax - valMin);

        return values.map((val, i) => [
            i * tScale + padding,
            svgHeight - ((val - valMin) * valScale + padding)
        ]);
    };

    const bodyColors = ['#D55E00', '#56B4E9', '#E69F00'];

    return (
        <div>
            <svg width={svgWidth} height={svgHeight}>
                {trajectory.map((body, index) => {
                    const xScaledPositions = getScaledCoordinates(body.x);
                    const yScaledPositions = getScaledCoordinates(body.y);

                    const xPathData = xScaledPositions.map((pos, i) =>
                        (i === 0 ? 'M' : 'L') + pos.join(',')
                    ).join(' ');

                    const yPathData = yScaledPositions.map((pos, i) =>
                        (i === 0 ? 'M' : 'L') + pos.join(',')
                    ).join(' ');

                    return (
                        <g key={index}>
                            <path
                                d={xPathData}
                                fill="none"
                                stroke={bodyColors[index]}
                                strokeWidth="2"
                            />
                            <path
                                d={yPathData}
                                fill="none"
                                stroke={bodyColors[index]}
                                strokeDasharray="4"
                                strokeWidth="2"
                            />
                        </g>
                    );
                })}
            </svg>
            <div>
                {trajectory.map((_, index) => (
                    <div key={index} style={{ display: 'inline-block', marginRight: '20px' }}>
                        <span style={{ color: bodyColors[index] }}>●</span> Body {index + 1} (solid: X, dashed: Y)
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrajectoryTimeVisualization;