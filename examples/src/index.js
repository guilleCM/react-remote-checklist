import React from 'react';
import { render} from 'react-dom';
import RemoteChecklist from '../../src';

const App = () => (
    <RemoteChecklist 
        url="http://127.0.0.1:5000/api/permissions/LookupPermissions"
        limit={10}
        label="description"
        value="value"
        inputValue={
            [
                {
                    "value": "5b3f3f36416adf1ba81ab5c0",
                    "description": "Can view Admin in sidebar"
                },
                {
                    "value": "5b3f3f37416adf1ba81ab5c1",
                    "description": "Can view Setup in sidebar"
                },
                {
                    "value": "5b3f3f37416adf1ba81ab5c2",
                    "description": "Can view Masters in sidebar"
                },
                {
                    "value": "5b3f3f37416adf1ba81ab5c3",
                    "description": "Can view Dingus in sidebar"
                }
            ]
            
        }
    />
);

render(<App />, document.getElementById("root"));