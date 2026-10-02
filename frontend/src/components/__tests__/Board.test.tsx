import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Board, toGrid, detectMove } from '../Board';

type CellValue = -1 | 0 | 1;

const initialBoard = (): CellValue[] => {
  const board = Array<CellValue>(64).fill(-1);
  board[27] = 1;
  board[28] = 0;
  board[35] = 0;
  board[36] = 1;
  return board;
};

// 黒が d3（index 19）に打ち、d4（index 27）の白を返した盤
const afterD3 = (): CellValue[] => {
  const board = initialBoard();
  board[19] = 0;
  board[27] = 0;
  return board;
};

// 盤の中の石（マスの最後の子要素）の transform
const discTransform = (label: string) =>
  (screen.getByRole('button', { name: label }).lastElementChild as HTMLElement).style.transform;
const scaleOf = (transform: string) => Number(/^scale\(([^)]+)\)/.exec(transform)?.[1]);

describe('toGrid', () => {
  it('converts the 64-cell array (-1/0/1) into board[y][x] (0/1/2)', () => {
    const grid = toGrid(initialBoard());
    expect(grid).toHaveLength(8);
    expect(grid[3][3]).toBe(2); // d4: White
    expect(grid[3][4]).toBe(1); // e4: Black
    expect(grid[0][0]).toBe(0); // a1: Empty
  });
});

describe('detectMove', () => {
  it('detects the move when exactly one cell changes from empty to a stone', () => {
    expect(detectMove(initialBoard(), afterD3())).toEqual({ x: 3, y: 2, color: 1 });
  });

  it('returns null when no stone was placed', () => {
    expect(detectMove(initialBoard(), initialBoard())).toBeNull();
    expect(detectMove(afterD3(), initialBoard())).toBeNull(); // Reset
  });

  it('returns null when more than one stone appeared (e.g. restored game)', () => {
    const restored = afterD3();
    restored[18] = 1;
    expect(detectMove(initialBoard(), restored)).toBeNull();
  });
});

describe('Board Component', () => {
  const OriginalResizeObserver = global.ResizeObserver;

  beforeAll(() => {
    // jsdom has no layout: give the container a width and stub ResizeObserver
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 640 });
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  });

  afterAll(() => {
    delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
    global.ResizeObserver = OriginalResizeObserver;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onCellClick with the board index (y * 8 + x)', () => {
    const onCellClick = jest.fn();
    render(<Board board={initialBoard()} onCellClick={onCellClick} />);

    expect(screen.getAllByRole('button')).toHaveLength(64);
    fireEvent.click(screen.getByRole('button', { name: 'd3' }));
    expect(onCellClick).toHaveBeenCalledWith(19);
  });

  it('can be played with the keyboard', () => {
    const onCellClick = jest.fn();
    render(<Board board={initialBoard()} onCellClick={onCellClick} />);

    fireEvent.keyDown(screen.getByRole('button', { name: 'f5' }), { key: 'Enter' });
    expect(onCellClick).toHaveBeenCalledWith(37);
  });

  it('is not clickable when disabled', () => {
    render(<Board board={initialBoard()} onCellClick={jest.fn()} disabled />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('animates the placed stone from scale 0 so the final position never flashes', () => {
    jest.useFakeTimers();
    const { rerender } = render(<Board board={initialBoard()} onCellClick={jest.fn()} />);

    rerender(<Board board={afterD3()} onCellClick={jest.fn()} />);
    expect(scaleOf(discTransform('d3'))).toBeCloseTo(0);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(discTransform('d3')).toBe('scale(1) scaleX(1)');
    expect(discTransform('d4')).toBe('scale(1) scaleX(1)');
  });

  it('does not animate when the whole board is replaced (restore / reset)', () => {
    const { rerender } = render(<Board board={initialBoard()} onCellClick={jest.fn()} />);
    const restored = afterD3();
    restored[18] = 1;

    rerender(<Board board={restored} onCellClick={jest.fn()} />);
    expect(discTransform('d3')).toBe('scale(1) scaleX(1)');
    expect(discTransform('c3')).toBe('scale(1) scaleX(1)');
  });
});
