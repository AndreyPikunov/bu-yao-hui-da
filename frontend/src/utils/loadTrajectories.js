function getBaseUrl() {
  return process.env.NODE_ENV === 'production'
    ? '/bu-yao-hui-da'
    : '';
}

async function loadTrajectories() {
    try {
        const baseUrl = getBaseUrl();
        const fileList = await fetch(`${baseUrl}/data/trajectories-index.json`);
        const fileListData = await fileList.json();

        const loadedTrajectories = await Promise.all(
            fileListData.map(async (fileName) => {
                const trajectoryResponse = await fetch(`${baseUrl}/data/trajectories/${fileName}`);
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