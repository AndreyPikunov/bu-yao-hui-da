import { useState, useEffect } from 'react';
import TrajectoryPlayer from './components/TrajectoryPlayer';
import loadTrajectories from './utils/loadTrajectories';

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

    if (loading) {
        return <div>Loading trajectories...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="App">
            <select
                value={selectedTrajectoryIndex}
                onChange={handleTrajectorySelection}
                disabled={trajectories.length === 0}
            >
                {trajectories.map((trajectory, index) => (
                    <option key={index} value={index}>
                        {trajectory.name}
                    </option>
                ))}
            </select>
            <TrajectoryPlayer
                trajectories={trajectories}
                selectedTrajectoryIndex={selectedTrajectoryIndex}
            />
        </div>
    );
}

export default App;