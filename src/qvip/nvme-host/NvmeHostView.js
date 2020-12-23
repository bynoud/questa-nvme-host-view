import React, { Component } from 'react';
import NvmeHostTxtParse from './NvmeHostParse';
import NvmeHostTable from './NvmeHostTable';

class NvmeHostView extends Component {

    constructor(props) {
        super(props);
        this.desc = {};
        this.headers = [];
        this.items = [];
        this.state = {
            status: "IDLE",
            fileParsed: false,
        };
    }

    render() {
        return <div>
            <input type="file" id="file-selector" onChange={(ev) => {this.loadFile(ev.target.files)}}></input>
            <p>Status: {this.state.status}</p>
            <div>{!this.state.fileParsed ? null :
                <NvmeHostTable desc={this.desc} headers={this.headers} items={this.items}></NvmeHostTable>}
            </div>
        </div>;
    
    }
    
    loadFile(files) {
        let fr = new FileReader();
        console.log("Paser...");
        this.setState({status: "File parsing..."})
        fr.onload = () => {
            try {
                const result = NvmeHostTxtParse(fr.result);
                this.desc = result.desc;
                this.headers = result.headers;
                this.items = result.items;
                this.setState({
                    status: "File parsing completed successfully",
                    fileParsed: true
                });
            } catch(err) {
                this.setState({status: "File parsing error: " + err.message});
            }
        }
        fr.readAsText(files[0]);
    }
    
}



export default NvmeHostView;
