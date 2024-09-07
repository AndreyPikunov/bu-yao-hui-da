import React, { useEffect, useState } from 'react';

function TrajectoryLoader({ setTrajectories }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadTrajectories() {
            try {
                setLoading(true);

                const fileList = ['Broucke A 1.json', 'Broucke A 10.json', 'Broucke A 11.json', 'Broucke A 12.json', 'Broucke A 13.json', 'Broucke A 14.json', 'Broucke A 15.json', 'Broucke A 16.json', 'Broucke A 2.json', 'Broucke A 3.json', 'Broucke A 4.json', 'Broucke A 5.json', 'Broucke A 6.json', 'Broucke A 7.json', 'Broucke A 8.json', 'Broucke A 9.json', 'Broucke R 1.json', 'Broucke R 10.json', 'Broucke R 11.json', 'Broucke R 12.json', 'Broucke R 13.json', 'Broucke R 2.json', 'Broucke R 3.json', 'Broucke R 4.json', 'Broucke R 5.json', 'Broucke R 6.json', 'Broucke R 7.json', 'Broucke R 8.json', 'Broucke R 9.json', 'Bruck R4.json', 'Hand-in-hand-in-oval.json', 'I.A.1 butterfly I.json', 'I.A.2 butterfly II.json', 'I.A.3 bumblebee.json', 'I.B.1 moth I.json', 'I.B.2 moth II.json', 'I.B.3 butterfly III.json', 'I.B.4 moth III.json', 'I.B.5 goggles.json', 'I.B.6 butterfly IV.json', 'I.B.7 dragonfly.json', 'II.B.1 yarn.json', 'II.C.2a yin-yang I.json', 'II.C.2b yin-yang I.json', 'II.C.3a yin-yang II.json', 'II.C.3b yin-yang II.json', 'M8.json', 'NC1.json', 'NC2.json', 'O1.json', 'O10.json', 'O11.json', 'O12.json', 'O13.json', 'O14.json', 'O15.json', 'O2.json', 'O3.json', 'O4.json', 'O5.json', 'O6.json', 'O7.json', 'O8.json', 'O9.json', 'Oval, catface, and starship.json', 'Ovals with flourishes.json', 'PT1.json', 'PT2.json', 'S8.json', 'Sheen 2016.json', 'Skinny pineapple.json'];  // ToDo: Make this dynamic

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