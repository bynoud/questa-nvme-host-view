import { Component } from "react";

class NvmeHostList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <table className="NvmeHostList">
            <thead><tr>
                {this.props.opts.headers.map(val => <th key={val}>{val}</th>)}
            </tr></thead>
            <tbody>
                {this.props.items.map((item, idx) => {
                    if (this.props.opts.itemTypes.includes(item.TYPE)) return <tr key={idx}>
                        {this.props.opts.headers.map(val => <td key={val}>
                            <div>{item[val]}</div>
                        </td>)}
                    </tr>;
                    else return null;
                })}
            </tbody>
        </table>
    }
}

export default NvmeHostList;