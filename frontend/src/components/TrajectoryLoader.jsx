import React, { useEffect, useState } from 'react';

function TrajectoryLoader({ setTrajectories }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadTrajectories() {
            try {
                setLoading(true);

                const fileList = ["trajectories_1.json", "trajectories_3.json", "trajectories_122.json"];  // ToDo: Make this dynamic

                const loadedTrajectories = await Promise.all(
                    fileList.map(async (fileName) => {
                        const trajectoryResponse = await fetch(`/trajectories/${fileName}`);
                        if (!trajectoryResponse.ok) {
                            throw new Error(`Failed to load trajectory: ${fileName}`);
                        }
                        const trajectoryData = await trajectoryResponse.json();
                        return {
                            name: fileName.replace('.json', ''),
                            data: trajectoryData
                        };
                    })
                );

                setTrajectories(loadedTrajectories);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }

        loadTrajectories();
    }, [setTrajectories]);

    if (loading) {
        return <div>Loading trajectories...</div>;
    }

    if (error) {
        return <div>Error loading trajectories: {error}</div>;
    }

    return <div>Trajectories loaded successfully</div>;
}

export default TrajectoryLoader;