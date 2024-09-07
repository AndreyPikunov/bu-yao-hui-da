async function loadTrajectories() {
    try {
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

        return loadedTrajectories;
    } catch (err) {
        throw new Error(`Error loading trajectories: ${err.message}`);
    }
}

export default loadTrajectories;