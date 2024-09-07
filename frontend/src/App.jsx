import { useState } from 'react';
import TrajectoryLoader from './components/TrajectoryLoader';
import TrajectoryPlayer from './components/TrajectoryPlayer';

function App() {
    const [trajectories, setTrajectories] = useState([]);
    const [selectedTrajectoryIndex, setSelectedTrajectoryIndex] = useState(0);

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
            <TrajectoryPlayer
                trajectories={trajectories}
                selectedTrajectoryIndex={selectedTrajectoryIndex}
            />
            <h1>Trajectory Loader</h1>
            <TrajectoryLoader setTrajectories={setTrajectories} />
            {/* Rest of your app components */}
        </div>
    );
}

export default App;