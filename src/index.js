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
                    key={"rcl-cb-in-"+this.props.index}
                    id={"rcl-cb-"+this.props.index} 
                    value={this.props.value}
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
            data: null,
            nextUrlCall: null,
            loading: true,
        }
    }

    componentDidMount() {
        // window.addEventListener('scroll', this.handleScroll);
        this.fetchData();
    }

    componentWillUnmount() {
        // window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        console.log("scroll");
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
                    data: response.data,
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
        let loader = loading == true ? <p>Loading</p> : null;
        return(
            <div className="rcl-container-box">
                <div className="rcl-container-available">
                    <ul 
                        className="rcl-list-control" 
                        id="rcl-list-control-for-permissions"
                        onScroll={this.handleScroll}
                    >
                        {loading}
                        {this.state.data != null &&
                            this.state.data.map((item, index) => 
                                <ListItem 
                                    key={"rcl-li-"+index} 
                                    index={index} 
                                    value={item.value} 
                                    label={item.description}/>
                            )
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
    // icon: PropTypes.string,
    url: PropTypes.string.isRequired,
}
RemoteChecklist.defaultProps = {
    label: "description",
    value: "value",
}

export default RemoteChecklist;