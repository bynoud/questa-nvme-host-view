import React, { Component } from 'react';
import NvmeHostOpt from './NvmeHostOpt';
import NvmeHostList from './NvmeHostList';
import NvmeHostTxtParse from './NvmeHostParse';
import NvmeHostTable from './NvmeHostTable';

const headerLine = "------------------------------------------";
const defaultViewHeaders = ["BDF", "TYPE", "ADDR", "DATA"];
const defaultViewItems = ["REG", "A_INTA", "D_INTA", "MSIX", "MSI", "UNKN"];

// const descriptor = {};
// const headers = [];
// const items = [];



class NvmeHostView extends Component {

    constructor(props) {
        super(props);
        this.desc = {};
        this.headers = [];
        this.items = [];
        this.state = {
            descriptor: {},
            headers: [],
            items: [],
            itemTypes: [],
            opts: {
                headers: defaultViewHeaders,
                itemTypes: defaultViewItems,  // empty is all type
            },

            fileParsed: false,
        };

        this.optChanged = this.optChanged.bind(this);
        // socket.on('ziga-guide', this.ziga_guide_recv.bind(this));
    }

    render() {
        return <div>
            <input type="file" id="file-selector" onChange={(ev) => {this.loadFile(ev.target.files)}}></input>
            <div>{!this.state.fileParsed ? null :
                <NvmeHostTable desc={this.desc} headers={this.headers} items={this.items}></NvmeHostTable>}
            </div>
        </div>;
    
    }

    optChanged(field, subfield, val) {
        let opts = {...this.state.opts};
        let idx = opts[field].indexOf(subfield);
        console.log("optChange", this.state, field, subfield, val, opts, idx);
        if (val && idx < 0) opts[field].push(subfield);
        if (!val && idx >= 0) opts[field].splice(idx, 1);
        this.setState({opts:opts});
    }
    
    
    loadFile(files) {
        let fr = new FileReader();
        fr.onload = () => {
            const result = NvmeHostTxtParse(fr.result);
            this.desc = result.desc;
            this.headers = result.headers;
            this.items = result.items;
            this.setState({fileParsed: true});
        }
        fr.readAsText(files[0]);
    }
    
    txtParse(txt) {
        //console.log("_parse", txt);
        let lines = txt.split('\n');
        let curPos = "init";
        let curName = "";
        let curItem = null;
        let headers = [];
        let descriptor = {};
        let items = [];
        let itemTypes = [];
        let itemIndex = 1;
        let dataCnt = 0;
        for (let linei=0; linei<lines.length; linei++) {
            let line = lines[linei];
            let data = line.split('|').map((v) => v.trim())
            if (line.startsWith(headerLine)) {
                switch (curPos) {
                    case "init": curPos = "descHeader"; break;
                    case "descHeader": curPos = "desc"; break;
                    case "desc": curPos = "preHeader"; this.setState({descriptor:descriptor}); break;
                    case "preHeader": curPos = "header"; break;
                    case "header": curPos = "body"; this.setState({headers:headers.filter(v => v !== "")}); break;
                    default: curPos = "undef";
                };
            } else {
    
                switch (curPos) {
                    case "desc":
                        if (data[1] === "") {
                            descriptor[curName] += " " + data[2];
                        } else {
                            curName = data[1];
                            descriptor[curName] = data[2];
                        }
                        break;
    
                    case "header":
                        for (let hi=0; hi<data.length; hi++) {
                            headers[hi] = (headers[hi] || "") + data[hi];
                        }
                        break;
    
                    case "body":
                        if (line !== "") {
                            let item = data.reduce((obj, val, i) => {obj[headers[i]] = val; return obj}, {});
                            if (item.DATA.startsWith("----")) {
                                item.DATA = [item["CMD/REG_DATA"]];
                                item._DCNT_ = 1;
                                // item.DATA = item["CMD/REG_DATA"];
                            } else {
                                item.DATA = [item.DATA.split("-")[1]];
                                item._DCNT_ = 1;
                                // item.DATA = item.DATA.split("-")[1];
                            }
                            if (item.TYPE === "" && item.DATA.length > 0) {
                            // if (item.TYPE === "" && item.DATA !== "") {
                                curItem.DATA.push(item.DATA[0]);
                                curItem._DCNT_++;
                                // if (dataCnt == 8) { curItem.DATA = "<div>"+curItem.DATA+"</div>"; dataCnt = 0; }
                                // dataCnt++;
                                // curItem.DATA = item.DATA + " " + curItem.DATA;
                                // console.log(curItem.DATA, dataCnt)
                            } else {
                                curItem = item;
                                if (!itemTypes.includes(item.TYPE)) itemTypes.push(item.TYPE);
                                items.push(item);
                            }
                        }
                        break;
    
                    default:
                        break;
                }
    
    
            }
        }
        

        console.log("item", items);
        console.log("state", this.state);
        this.setState({items:items});
        this.setState({itemTypes:itemTypes});
    
        console.log("state", this.state);
    }
}



export default NvmeHostView;
