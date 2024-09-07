async function loadTrajectories() {
    try {
        // Use the correct path for GitHub Pages
        const fileList = await fetch('/bu-yao-hui-da/data/trajectories-index.json');
        const fileListData = await fileList.json();

        const loadedTrajectories = await Promise.all(
            fileListData.map(async (fileName) => {
                // Update the path here as well
                const trajectoryResponse = await fetch(`/bu-yao-hui-da/data/trajectories/${fileName}`);
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