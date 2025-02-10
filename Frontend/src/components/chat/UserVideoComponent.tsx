import React from 'react';
import OpenViduVideoComponent from './OvVideo';
import { StreamManager } from 'openvidu-browser';

type UserVideoComponentProps = {
    streamManager: StreamManager | null;
};

const UserVideoComponent: React.FC<UserVideoComponentProps> = ({ streamManager }) => {
    return (
        <div>
            {streamManager && (
                <div className="streamcomponent">
                    <OpenViduVideoComponent streamManager={streamManager} />
                </div>
            )}
        </div>
    );
};

export default UserVideoComponent;
