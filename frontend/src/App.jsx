import { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Typography,
    Select,
    MenuItem,
    Paper,
    Box,
    Stack,
    CssBaseline,
    ThemeProvider,
    createTheme
} from '@mui/material';
import TrajectoryPlayer from './components/TrajectoryPlayer';
import loadTrajectories from './utils/loadTrajectories';
import TrajectoryVisualization from './components/TrajectoryVisualization';
import TrajectoryTimeVisualization from './components/TrajectoryTimeVisualization';
import { createDarkGrainyTheme } from './utils/backgroundUtils';

function App() {
    const [trajectories, setTrajectories] = useState([]);
    const [selectedTrajectoryIndex, setSelectedTrajectoryIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTrajectories() {
            try {
                setLoading(true);
                const loadedTrajectories = await loadTrajectories();
                setTrajectories(loadedTrajectories);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }

        fetchTrajectories();
    }, []);

    const handleTrajectorySelection = (event) => {
        setSelectedTrajectoryIndex(Number(event.target.value));
    };
    const theme = useMemo(() => createDarkGrainyTheme(), []);

    if (loading) {
        return <div>Loading trajectories...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const selectedTrajectory = trajectories[selectedTrajectoryIndex];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg">
                <Stack spacing={4} sx={{ my: 4 }} alignItems="center">
                    <Typography variant="h3" component="h1" gutterBottom align="center">
                        Cosmic Algo Rave
                    </Typography>
                    <Paper elevation={3} sx={{ p: 2, width: '100%', maxWidth: 600, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Select
                                value={selectedTrajectoryIndex}
                                onChange={handleTrajectorySelection}
                                disabled={trajectories.length === 0}
                                sx={{ flexGrow: 1 }}
                            >
                                {trajectories.map((trajectory, index) => (
                                    <MenuItem key={index} value={index}>
                                        {trajectory.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <TrajectoryPlayer trajectory={selectedTrajectory.data} />
                        </Box>
                    </Paper>

                    <Paper elevation={3} sx={{ p: 2, width: '100%', maxWidth: 600, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                        <TrajectoryVisualization trajectory={selectedTrajectory.data} />
                    </Paper>
                    <Paper elevation={3} sx={{ p: 2, width: '100%', maxWidth: 600, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                        <TrajectoryTimeVisualization trajectory={selectedTrajectory.data} />
                    </Paper>
                </Stack>
            </Container>
        </ThemeProvider>
    );
}

export default App;