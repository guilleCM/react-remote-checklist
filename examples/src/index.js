import React from 'react';
import { render} from 'react-dom';
import RemoteChecklist from '../../src';

const App = () => (
    <RemoteChecklist 
        url="http://127.0.0.1:5000/api/permissions/LookupPermissions"
        label="description"
        value="value"
        inputValue={
            [
                {
                    "value": "5b3f3f39416adf1ba81ab5ca",
                    "description": "Can view Setup / AppSetting in sidebar"
                },
                {
                    "value": "5b3f3f3a416adf1ba81ab5cb",
                    "description": "Can view Admin / AccessControl in sidebar"
                },
                {
                    "value": "5b3f3f3a416adf1ba81ab5cc",
                    "description": "Can view Admin / ChannelRateLimit in sidebar"
                },
            ]
        }
    />
);

render(<App />, document.getElementById("root"));