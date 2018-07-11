import React from 'react';
import PropTypes from "prop-types";
import axios from "axios";
import './styles.css';

class ListItem extends React.Component {
    render() {
        return(
            <li className="rcl-list-control-item" key={"rcl-cb-"+this.props.index}>
                <input 
                    type="checkbox"
                    checked={this.props.checked}
                    key={"rcl-cb-in-"+this.props.index}
                    id={"rcl-cb-"+this.props.index} 
                    value={this.props.value}
                    onChange={(e) => this.props.handleCheck(e)}
                />
                <label htmlFor={"rcl-cb-"+this.props.index}>{this.props.label}</label>
            </li>            
        )
    }
}

class RemoteChecklist extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            data: [],
            nextUrlCall: null,
            loading: true,
            dataSelected: props.inputValue.map(item => item.value),
            initData: props.inputValue.map(item => item.value),
            lastScroll: 0,
        }
        this.listRef = React.createRef();
        this.handleCheck = this.handleCheck.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.data.length != prevState.data.length) {
            this.listRef.current.scrollTop = this.state.lastScroll;
        }
    }

    handleScroll(event) {
        let elem = this.listRef.current;
        let component = this;
        if (elem.scrollHeight - elem.scrollTop == elem.clientHeight && !this.state.loading) {
            this.lastScroll = elem.scrollTop;
            this.setState({loading: true, lastScroll: elem.scrollTop}, () => {
                component.fetchData();
            })
        }
    }

    handleCheck(event) {
        let value = event.target.value
        let newDataSelected = this.state.dataSelected.slice();
        if (newDataSelected.includes(value)) {
            let index = newDataSelected.indexOf(value);
            newDataSelected.splice(index, 1);
            this.setState({
                dataSelected: newDataSelected
            });
        }
        else {
            newDataSelected.push(value);
            this.setState({
                dataSelected: newDataSelected
            });
        }
    }

    fetchData() {
        let component = this;
        let url = this.state.nextUrlCall == null ? this.props.url : this.state.nextUrlCall;
        let dataPost = {}
        axios.post(
            url,
            dataPost,
            {headers: {
                'Content-Type': 'application/json',
                },
            }
        ).then(
            response => {
                component.setState({
                    data: component.state.data.concat(response.data),
                    nextUrlCall: 'http://localhost:5000/api/permissions/LookupPermissions?skip=10&limit=10',
                    loading: false,
                })
            }
        ).catch(
            error => {
                console.log(error);
                component.setState({
                    error: true,
                    loading: false,
                })
            }
        )
    }

    render() {
        const loading = this.state.loading;
        let loader = loading == true ? <img src="/src/spinner.svg" alt="Loading..." style={{width: '100%', height: '100%'}}/> : null;
        return(
            <div className="rcl-container-box">
                <div className="rcl-container-available">
                    <ul 
                        className="rcl-list-control" 
                        ref={this.listRef}
                        onScroll={(e) => this.handleScroll(e)}
                    >
                        {loader}
                        {!this.state.loading &&
                            this.props.inputValue.map((item, index) => 
                                <ListItem
                                    handleCheck={this.handleCheck}
                                    checked={this.state.dataSelected.includes(item.value)}
                                    key={"rcl-li-sel-"+index}
                                    index={"sel-"+index}
                                    value={item.value}
                                    label={item.description}/>
                            )
                        }
                        {this.state.data.length > 0 && !this.state.loading &&
                            this.state.data.map((item, index) => {
                                if (!this.state.initData.includes(item.value))
                                    return <ListItem
                                        handleCheck={this.handleCheck}
                                        checked={this.state.dataSelected.includes(item.value)} 
                                        key={"rcl-li-"+index} 
                                        index={index} 
                                        value={item.value} 
                                        label={item.description}/>
                                else
                                    return null
                            })
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

RemoteChecklist.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    inputValue: PropTypes.array,
    url: PropTypes.string.isRequired,
}
RemoteChecklist.defaultProps = {
    label: "description",
    value: "value",
    inputValue: [],
}

export default RemoteChecklist;