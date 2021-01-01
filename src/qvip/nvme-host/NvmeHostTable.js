import React from 'react'
import styled from 'styled-components';
import { useTable, useFilters, useColumnOrder,
         useBlockLayout, useResizeColumns } from 'react-table';

const InitHiddenColumns = [
    "DEBUG ID",
    "CMD/REG_DATA",
    "MISC",
    "CID",
    "PSDT",
    "PRP2/SGL1[39:32]",
    "PRP1/SGL1[31:24]",
    "STS/SLBA/PC",
    "SQID",
    "CQID","START TIME",
    "END TIME"
];

const initFilterableHeader = ["BDF", "SRC", "RW", "TYPE"];

const initColumnWidth = {
    "BDF": 80,
    "SRC": 60,
    "RW": 60,
    "TYPE": 100,
    "REG_NAME/QENTRY": 100,
    "ADDR": 180,
    "NSID": 95,
    "DATA": 200,
    "__default__": 150,
}

// FIXME: should use raqndomize, current palete got from https://coolors.co/palettes/trending
const lightColors = ["#FFBABA", "#FFDCB2", "#FDFFC3", "#D1FFC7", "#A9F8FF", "#AECDFF", "#C8BFFF", "#FFD0FF", "#FFFFFB"];

const textColors = {
    "REG": "#e63946",
    "H": "#e63946",
    "D": "#14213d",
    "__default__": "#14213d",
}

const Styles = styled.div`
    padding: 1rem;

    .filtered {
        color: red;
    }

    .FilterOptions {
        position: absolute;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        padding: 12px 16px;
        z-index: 1;
    }

    .table {
        display: inline-block;
        border-spacing: 0;
        border: 1px solid black;
        font-family: monospace;
        font-size: larger;

        .stickyheader {
            position: sticky;
            top: 0;
            background: white;
            z-index: 1000
        }

        .tr {
            :last-child {
                .td {
                    border-bottom: 0;
                }
            }
        }

        .th {
            word-break: break-word;
        }

        .th,
        .td {
            margin: 0;
            padding: 0.5rem;
            border-bottom: 1px solid black;
            border-right: 1px solid black;
            
            ${'' /* In this example we use an absolutely position resizer, so this is required. */}
            position: relative;
            :last-child {
                border-right: 0;
            }
            .resizer {
                display: inline-block;
                // background: blue;
                width: 10px;
                height: 100%;
                position: absolute;
                right: 0;
                top: 0;
                transform: translateX(50%);
                z-index: 1;
                ${'' /* prevents from scrolling while dragging on touch devices */}
                touch-action:none;

                &.isResizing {
                    background: red;
                }
            }
        }
    }
`

// Define a default UI for filtering
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
  }) {
    const count = preFilteredRows.length
  
    return (
        <input
            value={filterValue || ''}
            onChange={e => {
            setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
            }}
            placeholder={`Search ${count} records...`}
        />
    )
}
  
// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
}) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
        const options = new Set()
        preFilteredRows.forEach(row => {
            options.add(row.values[id])
        })
        const optVals = [...options.values()];
        return {allOpt: optVals, filterOpt: optVals.reduce((obj,v) => (obj[v]=false, obj), {})}
    }, [id, preFilteredRows])
  
    // Render a multi-select box
    return (
        <div className="FilterGroup">
            {options.allOpt.map((option,i) => <label  key={i} style={{display: "block", textAlign: "left"}}>
                <input type="checkbox" value={option}
                    checked={options.filterOpt[option]}
                    onChange={e => {
                        options.filterOpt[option] = e.target.checked;
                        let filterValues = options.allOpt.reduce((arr,v) => {
                            if (options.filterOpt[v]) arr.push(v);
                            return arr;
                        }, []);
                        console.log("FF", options, filterValues);
                        setFilter(filterValues.length===0 ? undefined : filterValues);
                    }}
                ></input>{option}
            </label>)}
        </div>
    )
}

function PopupMultiSelectFilter({
    column: { filterValue, setFilter, preFilteredRows, id, Options },
}) {
    // // Calculate the options for filtering
    // // using the preFilteredRows
    // const options = React.useMemo(() => {
    //     const options = new Set()
    //     preFilteredRows.forEach(row => {
    //         options.add(row.values[id])
    //     })
    //     const optVals = [...options.values()];
    //     return optVals;
    //     // return {allOpt: optVals, filterOpt: optVals.reduce((obj,v) => (obj[v]=false, obj), {})}
    // }, [id, preFilteredRows])

    const [showOpt, setShowOpt] = React.useState(false);
    let dropdownMenu = null;
    const disableOpt = (event) => {
        if (dropdownMenu !== null && !dropdownMenu.contains(event.target)) {
            setShowOpt(false);
            document.removeEventListener('click', disableOpt);
        }
    };
    const enableOpt = (event) => {
        setShowOpt(true);
        // event.preventDefault();
        document.addEventListener('click', disableOpt);
    };


    const curFilterValue = React.useMemo(() => filterValue ? [...filterValue] : [], []);
    console.log("RenderFilter", id, filterValue, curFilterValue);

    const [filterEnb, setFilterEnb] = React.useState(curFilterValue.length===0 ? false : true);
    
  
    // Render a multi-select box
    return (
        <div className="FilterGroup">
            <button onClick={enableOpt} className={filterEnb?"filtered":""}>Filter</button>
            {!showOpt ? null :
            <div className="FilterOptions" ref={(element) => {dropdownMenu = element}}>
                {Options.map((option,i) => <label  key={i} style={{display: "block", textAlign: "left"}}>
                    <input type="checkbox" value={option}
                        checked={curFilterValue.includes(option)}
                        onChange={e => {
                            const idx = curFilterValue.indexOf(option);
                            if (!e.target.checked && idx >= 0) {
                                curFilterValue.splice(idx,1);
                            }
                            if (e.target.checked && idx < 0) {
                                curFilterValue.push(option)
                            }
                            console.log("FF", Options, curFilterValue);
                            setFilterEnb(curFilterValue.length===0 ? false : true);
                            setFilter(curFilterValue.length===0 ? undefined : curFilterValue);
                            // filterOpt[option] = e.target.checked;
                            // console.log("It's change", option, e.target.checked, options);
                            // let filterValues = options.reduce((arr,v) => {
                            //     if (filterOpt[v]) arr.push(v);
                            //     return arr;
                            // }, []);
                            // console.log("FF", options, filterValues);
                            // setFilter(filterValues.length===0 ? undefined : filterValues);
                        }}
                    ></input>{option}
                </label>)}
            </div>}
        </div>
    )
}


// Create a default prop getter
// const defaultPropGetter = (...args) => {console.log("PropGet", ...args); return {}};
const defaultPropGetter = () => ({});


function Table({ columns, data, bgrColor,
    // getColumnProps = (...args) => defaultPropGetter("Col", ...args),
    // getRowProps = (...args) => defaultPropGetter("Row", ...args),
    // getCellProps = (...args) => defaultPropGetter("Cell", ...args),
    getColumnProps = defaultPropGetter,
    // getRowProps = defaultPropGetter,
    getCellProps = defaultPropGetter,
}) {
    const defaultColumn = React.useMemo(
        () => ({
            minWidth: 30,
            width: 150,
            maxWidth: 400,
            Filter: DefaultColumnFilter, // Default Filter
        }),
        []
    )
  
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        visibleColumns,
        prepareRow,
        allColumns,
        setColumnOrder,
        state,
        resetResizing,
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            initialState: {hiddenColumns: InitHiddenColumns},
        },
        useColumnOrder,
        useFilters,
        useBlockLayout,
        useResizeColumns
    );

    const getRowProps = React.useCallback((row) => ({
        style: {
            background: bgrColor[row.values["BDF"]],
            color: textColors[row.values["SRC"]] || textColors["__default__"],
        }
    }), [bgrColor, textColors]);

    console.log("TableRender");
  
    return (
        <>
            <div className="globalOptions">
                {allColumns.map(column => <div key={column.id}>
                    <label><input type="checkbox" {...column.getToggleHiddenProps()}/>{column.id}</label>
                </div>)}
            </div>

            {/* <button onClick={resetResizing}>Reset Resizing</button> */}
            <div>
            <div {...getTableProps()} className="table">
                <div className="stickyheader">
                {headerGroups.map(headerGroup => (
                    <div {...headerGroup.getHeaderGroupProps()} className="tr">
                    {headerGroup.headers.map(column => (
                        <div {...column.getHeaderProps()} className="th">
                            {column.render('Header')}
                            {/* {column.render('Filter')} */}
                            <div>{column.canFilter ? column.render('Filter') : null}</div>
                            {/* <div style={{display:column.canFilter?"inherit":"none"}}>{column.render('Filter')}</div> */}
                            {/* Use column.getResizerProps to hook up the events correctly */}
                            <div
                                {...column.getResizerProps()}
                                className={`resizer ${
                                column.isResizing ? 'isResizing' : ''
                                }`}
                            />
                        </div>
                    ))}
                    </div>
                ))}
                </div>
    
                <div {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row)
                    return (
                    <div {...row.getRowProps(getRowProps(row))} className="tr">
                        {row.cells.map(cell => {
                        return (
                            <div {...cell.getCellProps([
                                    {
                                        className: cell.column.className,
                                        style: cell.column.style,
                                    },
                                    getColumnProps(cell.column),
                                    getCellProps(cell),
                                ])} className="td">
                                {cell.render('Cell')}
                            </div>
                            
                        )
                        })}
                    </div>
                    )
                })}
                </div>
            </div>
            </div>
            <pre style={{display: "none"}}>
            <code>{JSON.stringify(state, null, 2)}</code>
            </pre>
        </>
    )
}

const NvmeHostTable = ({desc, headers, items}) => {
    const [filterableHeader, setFilterHeader] = React.useState(headers.reduce((obj, val) => {
        obj[val] = initFilterableHeader.includes(val);
        return obj;
    }, {}));

    const columns = React.useMemo(() => headers.map(val => {
        
        const options = new Set()
        items.forEach(item => {options.add(item[val])})

        return {
            Header: val,
            accessor: val,
            Filter: PopupMultiSelectFilter,
            filter: 'includesSome',
            disableFilters: !filterableHeader[val],
            width: (val in initColumnWidth) ? initColumnWidth[val] : initColumnWidth["__default__"],
            Options: [...options.values()],
        }
    }), [filterableHeader, headers, items]);

    const data = React.useMemo(() => items, [items]);

    const uDbf = new Set();
    const bgrColor = {};
    for (let item of items) uDbf.add(item["BDF"]);
    uDbf.forEach((bdf,i) => bgrColor[bdf] = lightColors[i%lightColors.length]);

    console.log("MainTableRender");

    return <Styles>
        <Table columns={columns} data={data} bgrColor={bgrColor}
            
        ></Table>
    </Styles>
}

export default NvmeHostTable;