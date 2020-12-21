import React from 'react'
import styled from 'styled-components';
import { useTable, useFilters, useColumnOrder } from 'react-table';
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

const Styles = styled.div`
padding: 1rem;
table {
  border-spacing: 0;
  border: 1px solid black;
  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }
  th,
  td {
    margin: 0;
    padding: 0.5rem;
    border-bottom: 1px solid black;
    border-right: 1px solid black;
    background: white;
    :last-child {
      border-right: 0;
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
                        setFilter(filterValues.length==0 ? undefined : filterValues);
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

function Table({ columns, data }) {
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

const initFilterableHeader = ["BDF", "SRC", "RW", "TYPE"]

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
        }
    }), []);

    const data = React.useMemo(() => items, []);

    return <Styles>
        <Table columns={columns} data={data}></Table>
    </Styles>
}

export default NvmeHostTable;