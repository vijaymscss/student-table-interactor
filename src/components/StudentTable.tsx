
import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
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

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'age',
      header: 'Age',
    },
    {
      accessorKey: 'mobile',
      header: 'Mobile No',
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
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

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const dragged = document.querySelector('.dragging');
    if (dragged) {
      const row = e.currentTarget as HTMLElement;
      const bounding = row.getBoundingClientRect();
      const offset = e.clientY - bounding.top;
    }
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
  });

  const handleResizeMouseDown = (e: React.MouseEvent, header: any) => {
    const startX = e.pageX;
    const startWidth = header.getSize();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(startWidth + (moveEvent.pageX - startX), 50);
      header.column.setSize(newWidth);
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
                    onMouseDown={e => handleResizeMouseDown(e, header)}
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
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                className={draggedRowIndex === index ? 'dragging' : ''}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
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
