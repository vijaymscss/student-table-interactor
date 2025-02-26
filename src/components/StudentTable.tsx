
import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Column,
} from '@tanstack/react-table';
import { Move } from 'lucide-react';
import '../styles/table.css';

interface Student {
  id: number;
  name: string;
  age: number;
  mobile: string;
  gender: 'male' | 'female';
  details: string;
}

const initialData: Student[] = [
  { id: 1, name: 'John Doe', age: 20, mobile: '123-456-7890', gender: 'male', details: 'Majoring in Computer Science. Active member of coding club.' },
  { id: 2, name: 'Jane Smith', age: 19, mobile: '234-567-8901', gender: 'female', details: 'Biology major. Part of student council.' },
  { id: 3, name: 'Mike Johnson', age: 21, mobile: '345-678-9012', gender: 'male', details: 'Engineering student. Captain of debate team.' },
  { id: 4, name: 'Sarah Williams', age: 20, mobile: '456-789-0123', gender: 'female', details: 'Psychology major. Volunteers at local shelter.' },
  { id: 5, name: 'Tom Brown', age: 22, mobile: '567-890-1234', gender: 'male', details: 'Mathematics student. Research assistant.' },
];

export const StudentTable = () => {
  const [data, setData] = useState(initialData);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [columnSizes, setColumnSizes] = useState<{ [key: string]: number }>({});

  const columns: ColumnDef<Student>[] = [
    {
      id: 'drag',
      header: '',
      size: 40,
      cell: () => (
        <div className="drag-handle">
          <Move size={20} />
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: columnSizes['name'] || 200,
    },
    {
      accessorKey: 'age',
      header: 'Age',
      size: columnSizes['age'] || 100,
    },
    {
      accessorKey: 'mobile',
      header: 'Mobile No',
      size: columnSizes['mobile'] || 150,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      size: columnSizes['gender'] || 200,
      cell: ({ row }) => (
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name={`gender-${row.original.id}`}
              value="male"
              checked={row.original.gender === 'male'}
              onChange={() => handleGenderChange(row.original.id, 'male')}
            />
            Male
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name={`gender-${row.original.id}`}
              value="female"
              checked={row.original.gender === 'female'}
              onChange={() => handleGenderChange(row.original.id, 'female')}
            />
            Female
          </label>
        </div>
      ),
    },
    {
      id: 'expand',
      header: '',
      size: 50,
      cell: ({ row }) => (
        <button
          className="expand-button"
          onClick={() => toggleRowExpansion(row.original.id)}
        >
          {expandedRows.has(row.original.id) ? '▼' : '▶'}
        </button>
      ),
    },
  ];

  const handleGenderChange = (id: number, gender: 'male' | 'female') => {
    setData(data.map(student => 
      student.id === id ? { ...student, gender } : student
    ));
  };

  const toggleRowExpansion = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleDragStart = (index: number) => {
    setDraggedRowIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedRowIndex === null) return;

    const newData = [...data];
    const [draggedItem] = newData.splice(draggedRowIndex, 1);
    newData.splice(targetIndex, 0, draggedItem);
    setData(newData);
    setDraggedRowIndex(null);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
  });

  const handleResizeMouseDown = (e: React.MouseEvent, header: any) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = header.getSize();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const width = Math.max(startWidth + (moveEvent.pageX - startX), 50);
      setColumnSizes(prev => ({
        ...prev,
        [header.id]: width,
      }));
      header.column.size = width;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  style={{ width: header.getSize() }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <div
                    className="resizer"
                    onMouseDown={(e) => handleResizeMouseDown(e, header)}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <React.Fragment key={row.original.id}>
              <tr
                draggable={false}
                className={draggedRowIndex === index ? 'dragging' : ''}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <td 
                    key={cell.id}
                    draggable={cellIndex === 0}
                    onDragStart={cellIndex === 0 ? () => handleDragStart(index) : undefined}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {expandedRows.has(row.original.id) && (
                <tr>
                  <td colSpan={columns.length} className="expanded-content">
                    {row.original.details}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
