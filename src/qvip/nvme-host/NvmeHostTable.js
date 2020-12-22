import React from 'react'
import styled from 'styled-components';
import { useTable, useFilters, useColumnOrder,
         useBlockLayout, useResizeColumns } from 'react-table';
import { motion, AnimatePresence } from 'framer-motion';

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
    "TYPE": 85,
    "REG_NAME/QENTRY": 100,
    "ADDR": 180,
    "NSID": 95,
    "DATA": 140,
    "__default__": 150,
}

// FIXME: should use raqndomize, current palete got from https://coolors.co/palettes/trending
const lightColors = ["#FFBABA", "#FFDCB2", "#FDFFC3", "#D1FFC7", "#A9F8FF", "#AECDFF", "#C8BFFF", "#FFD0FF", "#FFFFFB"];

const textColors = {
    "REG": "#e63946",
    "__default__": "#14213d",
}

const Styles = styled.div`
    padding: 1rem;

    .table {
        display: inline-block;
        border-spacing: 0;
        border: 1px solid black;

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
                background: blue;
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
    //     <select
    //         value={filterValue}
    //         onChange={e => {
    //             // setFilter(e.target.value || undefined)
    //             setFilter([e.target.value, "REG"])
    //         }}
    //     >
    //     <option value="">All</option>
    //     {options.map((option, i) => (
    //       <option key={i} value={option}>
    //         {option}
    //       </option>
    //     ))}
    //   </select>

        <div className="FilterGroup">
            {options.allOpt.map((option,i) => <label  key={i}>
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

function shuffle(arr) {
    arr = [...arr]
    const shuffled = []
    while (arr.length) {
        const rand = Math.floor(Math.random() * arr.length)
        shuffled.push(arr.splice(rand, 1)[0])
    }
    return shuffled
}

function Table1({ columns, data }) {
    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
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
    } = useTable(
      {
        columns,
        data,
        defaultColumn,
        initialState: {hiddenColumns: InitHiddenColumns}
      },
      useColumnOrder,
      useFilters,
    //   useSortBy
    )
  
    const spring = React.useMemo(
      () => ({
        type: 'spring',
        damping: 50,
        stiffness: 100,
      }),
      []
    )
  
    const randomizeColumns = () => {
      setColumnOrder(shuffle(visibleColumns.map(d => d.id)))
    }
  
    return (
        <>
            {/* <button onClick={() => randomizeColumns({})}>Randomize Columns</button> */}
            <div className="globalOptions">
                {allColumns.map(column => <div key={column.id}>
                    <label><input type="checkbox" {...column.getToggleHiddenProps()}/>{column.id}</label>
                </div>)}
            </div>

            <table {...getTableProps()}>
            <thead>
                {headerGroups.map((headerGroup, i) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                    <motion.th
                        {...column.getHeaderProps({
                        layoutTransition: spring,
                        style: {
                            minWidth: column.minWidth,
                        },
                        })}
                    >
                        {/* <div {...column.getSortByToggleProps()}> */}
                        {column.render('Header')}
                        {/* <span>
                            {column.isSorted
                            ? column.isSortedDesc
                                ? ' 🔽'
                                : ' 🔼'
                            : ''}
                        </span> */}
                        {/* </div> */}
                        <div>{column.canFilter ? column.render('Filter') : null}</div>
                    </motion.th>
                    ))}
                </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                <AnimatePresence>
                {rows.map((row, i) => {
                    prepareRow(row)
                    return (
                    <motion.tr
                        {...row.getRowProps({
                        layoutTransition: spring,
                        exit: { opacity: 0, maxHeight: 0 },
                        })}
                    >
                        {row.cells.map((cell, i) => {
                        return (
                            <motion.td
                            {...cell.getCellProps({
                                layoutTransition: spring,
                            })}
                            >
                            {cell.render('Cell')}
                            </motion.td>
                        )
                        })}
                    </motion.tr>
                    )
                })}
                </AnimatePresence>
            </tbody>
            </table>
            <pre>
            <code>{JSON.stringify(state, null, 2)}</code>
            </pre>
        </>
    )
}

// Create a default prop getter
// const defaultPropGetter = (...args) => {console.log("PropGet", ...args); return {}};
const defaultPropGetter = () => ({});


function Table({ columns, data,
    // getColumnProps = (...args) => defaultPropGetter("Col", ...args),
    // getRowProps = (...args) => defaultPropGetter("Row", ...args),
    // getCellProps = (...args) => defaultPropGetter("Cell", ...args),
    getColumnProps = defaultPropGetter,
    getRowProps = defaultPropGetter,
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
    )
  
    return (
        <>
            <div className="globalOptions">
                {allColumns.map(column => <div key={column.id}>
                    <label><input type="checkbox" {...column.getToggleHiddenProps()}/>{column.id}</label>
                </div>)}
            </div>

            <button onClick={resetResizing}>Reset Resizing</button>
            <div>
            <div {...getTableProps()} className="table">
                <div>
                {headerGroups.map(headerGroup => (
                    <div {...headerGroup.getHeaderGroupProps()} className="tr">
                    {headerGroup.headers.map(column => (
                        <div {...column.getHeaderProps()} className="th">
                            {column.render('Header')}
                            <div>{column.canFilter ? column.render('Filter') : null}</div>
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
            <pre>
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
        return {
            Header: val,
            accessor: val,
            Filter: SelectColumnFilter,
            filter: 'includesSome',
            disableFilters: !filterableHeader[val],
            width: (val in initColumnWidth) ? initColumnWidth[val] : initColumnWidth["__default__"],
        }
    }), [filterableHeader]);

    const data = React.useMemo(() => items, []);

    const uDbf = new Set();
    const bgrColor = {};
    for (let item of items) uDbf.add(item["BDF"]);
    uDbf.forEach((bdf,i) => bgrColor[bdf] = lightColors[i%lightColors.length]);

    return <Styles>
        <Table columns={columns} data={data}
            getRowProps={(row) => ({
                style: {
                    background: bgrColor[row.values["BDF"]],
                    color: textColors[row.values["TYPE"]] || textColors["__default__"],
                }
            })}
        ></Table>
    </Styles>
}

export default NvmeHostTable;