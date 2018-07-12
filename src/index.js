import React from 'react';
import PropTypes from "prop-types";
import axios from "axios";
import './styles.css';
import loaderImg from './images/spinner.svg';

class ListItem extends React.Component {
    render() {
        return(
            <li className={this.props.checked ? "rcl-list-control-item rcl-item-selected" : "rcl-list-control-item"} key={"rcl-cb-"+this.props.index}>
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
            skip: 0,
            stoppedFetch: false,
        }
        this.listRef = React.createRef();
        this.handleCheck = this.handleCheck.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.data.length != prevState.data.length || this.state.stoppedFetch != prevState.stoppedFetch) {
            this.listRef.current.scrollTop = this.state.lastScroll;
        }
        else if (this.state.dataSelected != prevState.dataSelected) {
            this.props.onChange(this.state.dataSelected);
        }
    }

    handleScroll(event) {
        let elem = this.listRef.current;
        let component = this;
        if (elem.scrollHeight - elem.scrollTop == elem.clientHeight && !this.state.loading && !this.state.stoppedFetch) {
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
                let nextSkip = component.state.skip + component.props.limit;
                if (response.data.length == 0) {
                    component.setState({
                        stoppedFetch: true,
                        loading: false,
                    })
                }
                else {
                    component.setState({
                        data: component.state.data.concat(response.data),
                        nextUrlCall: component.props.url+'?skip='+nextSkip+'&limit='+component.props.limit,
                        skip: nextSkip,
                        loading: false,
                    })
                }
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
        let loader = loading == true ? <img src={loaderImg} alt="Loading..." style={{width: '100%', height: '100%'}}/> : null;
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
                        {this.state.stoppedFetch && !this.state.loading &&
                            <li className="rcl-li-no-fetch"><span>{this.props.noDataMessage}</span></li>
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

function defaultOnChange(event) {
    console.log(event.length);
}

RemoteChecklist.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    inputValue: PropTypes.array,
    url: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    noDataMessage: PropTypes.string,
}
RemoteChecklist.defaultProps = {
    label: "description",
    value: "value",
    onChange: defaultOnChange,
    inputValue: [],
    noDataMessage: "No more data to fetch!",
}

export default RemoteChecklist;