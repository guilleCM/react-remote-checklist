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
                    data-label={this.props.label}
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
            valuesSelected: props.inputValue.map(item => item.value),
            dataSelected: props.inputValue,
            initData: props.inputValue.map(item => item.value),
            lastScroll: 0,
            skip: 0,
            stoppedFetch: false,
            filterValue: "",
        }
        this.listRef = React.createRef();
        this.delayTimer = null;
        this.handleCheck = this.handleCheck.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.data.length != prevState.data.length || this.state.stoppedFetch != prevState.stoppedFetch) {
            this.listRef.current.scrollTop = this.state.lastScroll;
        }
        else if (this.state.valuesSelected != prevState.valuesSelected) {
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
        let newValuesSelected = this.state.valuesSelected.slice();
        let newDataSelected = this.state.dataSelected.slice();
        if (newValuesSelected.includes(value)) {
            let index = newValuesSelected.indexOf(value);
            newValuesSelected.splice(index, 1);
            newDataSelected.splice(index, 1);
            this.setState({
                valuesSelected: newValuesSelected,
                dataSelected: newDataSelected,
            });
        }
        else {
            newValuesSelected.push(value);
            let dataItem = {};
            dataItem[this.props.value] = value;
            dataItem[this.props.label] = event.target.dataset.label;
            newDataSelected.push(dataItem);
            this.setState({
                valuesSelected: newValuesSelected,
                dataSelected: newDataSelected,
            });
        }
    }

    handleFilterChange(event) {
        clearTimeout(this.delayTimer);
        let component = this;
        let filter = event.target.value;
        this.delayTimer = setTimeout(function () {
            component.fetchData(filter);
        }, 350);
    }

    fetchData(filter="") {
        let component = this;
        let url = this.state.nextUrlCall == null || filter != "" ? this.props.url : this.state.nextUrlCall;
        let dataPost = {};
        let skip;
        let prevData;
        if (filter != "") {
            skip = 0;
            prevData = [];
            dataPost['filters'] = [
                {
                    'field': 'q',
                    'operator': 3,
                    'value': filter
                }
            ];
        } else {
            skip = this.state.skip;
            prevData = this.state.data;
            dataPost = this.state.filterValue != "" ? [{'field': 'q', 'operator': 3, 'value': this.state.filterValue}] : {};
        }
        axios.post(
            url,
            dataPost,
            {headers: {
                'Content-Type': 'application/json',
                },
            }
        ).then(
            response => {
                let nextSkip = skip + component.props.limit;
                let filterValue = "";
                if (filter != "") {
                    filterValue = filter;
                }
                else if (component.state.filterValue != "") {
                    filterValue = component.state.filterValue;
                }
                //check response
                if (response.data.length == 0) {
                    component.setState({
                        filterValue: filterValue,
                        stoppedFetch: true,
                        loading: false,
                    })
                }
                else {
                    component.setState({
                        filterValue: filterValue,
                        data: prevData.concat(response.data),
                        nextUrlCall: component.props.url+'?skip='+nextSkip+'&limit='+component.props.limit,
                        skip: nextSkip,
                        stoppedFetch: false,
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
                <input type="text" placeholder={this.props.searchInputPlaceholder} onChange={this.handleFilterChange} className={this.props.searchInputClass}/>
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
                                    checked={this.state.valuesSelected.includes(item.value)}
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
                                        checked={this.state.valuesSelected.includes(item.value)} 
                                        key={"rcl-li-"+index} 
                                        index={index} 
                                        value={item.value} 
                                        label={item.description}/>
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
    console.log(event);
}

RemoteChecklist.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    inputValue: PropTypes.array,
    url: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    noDataMessage: PropTypes.string,
    searchInputClass: PropTypes.string,
    searchInputPlaceholder: PropTypes.string,
}
RemoteChecklist.defaultProps = {
    label: "description",
    value: "value",
    onChange: defaultOnChange,
    inputValue: [],
    noDataMessage: "No more data to fetch!",
    searchInputClass: "rcl-search-input",
    searchInputPlaceholder: "Search...",
}

export default RemoteChecklist;