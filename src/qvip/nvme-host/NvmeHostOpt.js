import { Component } from "react";


class NvmeHostOpt extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div className="NvmeHostOptCont">
            <div>
                {this.props.headers.map((val, idx) => <label key={idx}>{val}
                    <input type="checkbox" value={val} 
                    checked={this.props.opts.headers.includes(val)}
                    onChange={(ev) => this.props.optChanged("headers", val, ev.target.checked)}/>
                    <span className="checkmark"></span>
                </label>)}
            </div>
            <p></p>
            <div>
                {this.props.itemTypes.map((val, idx) => <label key={idx}>{val}
                    <input type="checkbox" value={val} 
                    checked={this.props.opts.itemTypes.includes(val)}
                    onChange={(ev) => this.props.optChanged("itemTypes", val, ev.target.checked)}/>
                    <span className="checkmark"></span>
                </label>)}
            </div>
        </div>
    }
}

export default NvmeHostOpt;