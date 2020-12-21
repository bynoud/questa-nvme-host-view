

NvmeHostBeatParse = (files) => {
    let fr = new FileReader();
    fr.onload = () => _parse(fr.result);
    fr.readAsText(files[0])
}

_parse = (txt) => {
    console.log("_parse", txt);
}

export default NvmeHostBeatParse;
