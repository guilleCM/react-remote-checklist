import React from 'react';
import { render} from 'react-dom';
import RemoteChecklist from '../../src';

const App = () => (
    <RemoteChecklist 
        url="http://127.0.0.1:5000/api/permissions/LookupPermissions"
        label="description"
        value="value"
    />
);

render(<App />, document.getElementById("root"));