import React from 'react';
import { Box } from '@mui/material';

const TrajectoryTimeVisualization = ({ trajectory, currentStep }) => {
    if (!trajectory || trajectory.length !== 3) return null;

    const svgWidth = 600;
    const svgHeight = 400;
    const padding = 50;
    const aspectRatio = svgHeight / svgWidth;

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
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            width="100%"
        >
            <Box
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
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                >
                    {trajectory.map((body, index) => {
                        const xScaledPositions = getScaledCoordinates(body.x);
                        const yScaledPositions = getScaledCoordinates(body.y);

                        const xPathData = xScaledPositions.map((pos, i) =>
                            (i === 0 ? 'M' : 'L') + pos.join(',')
                        ).join(' ');

                        const yPathData = yScaledPositions.map((pos, i) =>
                            (i === 0 ? 'M' : 'L') + pos.join(',')
                        ).join(' ');

                        const currentXPosition = xScaledPositions[currentStep];
                        const currentYPosition = yScaledPositions[currentStep];

                        return (
                            <g key={index}>
                                <path
                                    d={xPathData}
                                    fill="none"
                                    stroke={bodyColors[index]}
                                    strokeWidth="2"
                                    style={{ zIndex: 1 }}
                                />
                                <path
                                    d={yPathData}
                                    fill="none"
                                    stroke={bodyColors[index]}
                                    strokeDasharray="4"
                                    strokeWidth="2"
                                    style={{ zIndex: 1 }}
                                />
                                <circle
                                    cx={currentXPosition[0]}
                                    cy={currentXPosition[1]}
                                    r="7"
                                    fill={bodyColors[index]}
                                    style={{ zIndex: 2 }}
                                />
                                <circle
                                    cx={currentXPosition[0]}
                                    cy={currentXPosition[1]}
                                    r="4"
                                    fill={"white"}
                                    style={{ zIndex: 3 }}
                                />
                                <circle
                                    cx={currentYPosition[0]}
                                    cy={currentYPosition[1]}
                                    r="7"
                                    fill={bodyColors[index]}
                                    style={{ zIndex: 2 }}
                                />
                                <circle
                                    cx={currentYPosition[0]}
                                    cy={currentYPosition[1]}
                                    r="4"
                                    fill={"white"}
                                    style={{ zIndex: 2 }}
                                />
                            </g>
                        );
                    })}
                </svg>
            </Box>
            <Box key="legend" display="flex" alignItems="center" justifyContent="flex-start" mt={2}>
                <Box display="flex" alignItems="center" mr={2}>
                    <svg width="30" height="20">
                        <line x1="0" y1="10" x2="15" y2="10" stroke="white" strokeWidth="2" />
                        <text x="20" y="15" fill="white" fontSize="12">x</text>
                    </svg>
                </Box>
                <Box display="flex" alignItems="center">
                    <svg width="30" height="20">
                        <line x1="0" y1="10" x2="15" y2="10" stroke="white" strokeWidth="2" strokeDasharray="4" />
                        <text x="20" y="15" fill="white" fontSize="12">y</text>
                    </svg>
                </Box>
            </Box>
        </Box>
    );
};

export default TrajectoryTimeVisualization;