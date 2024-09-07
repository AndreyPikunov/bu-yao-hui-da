import React, { useEffect, useState } from 'react';

function TrajectoryLoader({ setTrajectories }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadTrajectories() {
            try {
                setLoading(true);


                const fileList = await fetch('/data/trajectories-index.json');
                const fileListData = await fileList.json();

                const loadedTrajectories = await Promise.all(
                    fileListData.map(async (fileName) => {
                        const trajectoryResponse = await fetch(`/data/trajectories/${fileName}`);
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