
const headerLine = "------------------------------------------";

// return (desc, headers, items)
const nvmeHostTxtParse = (txt) => {
    //console.log("_parse", txt);
    let lines = txt.split('\n');
    let curPos = "init";
    let curName = "";
    let curItem = null;
    let headers = [];
    let descriptor = {};
    let items = [];
    let itemTypes = [];
    for (let linei=0; linei<lines.length; linei++) {
        let line = lines[linei];
        let data = line.split('|').map((v) => v.trim())
        if (line.startsWith(headerLine)) {
            switch (curPos) {
                case "init": curPos = "descHeader"; break;
                case "descHeader": curPos = "desc"; break;
                case "desc": curPos = "preHeader"; break;
                case "preHeader": curPos = "header"; break;
                case "header": curPos = "body"; break;
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
    

    console.log("item", headers, items);
    headers = headers.filter(v => v !== ""); 
    return {descriptor, headers, items};
}

export default nvmeHostTxtParse;