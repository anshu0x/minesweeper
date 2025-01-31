import { FC, memo } from 'react';
import { match, P } from 'ts-pattern';
import styled, { css } from 'styled-components';
import { shadow } from '../styles/shadow';
import { Coords } from '../utils/constants';
import { MinesNumber } from './MinesNumber';
import mineImage from '../images/mine.svg';
import crossedMineImage from '../images/crossedMine.svg';
import flagImage from '../images/flag.svg';
import { preventDefault } from '../utils/preventDefault';
import { useGameStore } from '../store/gameStore';
import { useLongTouch } from '../utils/useLongTouch';
import { isFlagged, isNumberCell } from '../services/cell';
import shallow from 'zustand/shallow';

type CellProps = Coords;

export const Cell: FC<CellProps> = memo(({ x, y }) => {
  const { gameStatus, cellData, clickCell, clickNumberCell, flagCell } =
    useGameStore(
      ({ status, board, clickCell, clickNumberCell, flagCell }) => ({
        gameStatus: status,
        cellData: board[y][x],
        clickCell,
        clickNumberCell,
        flagCell,
      }),
      shallow,
    );

  const handleClickCell = () => clickCell({ x, y });
  const handleClickNumberCell = () => clickNumberCell({ x, y });
  const handleFlagCell = () => flagCell({ x, y });

  const longTouchProps = useLongTouch(handleFlagCell);

  return match([cellData, gameStatus] as const)
    .with(['ExplodedMine', P._], () => (
      <OpenCell aria-label={`Exploded mine`} exploded>
        <MineIcon />
      </OpenCell>
    ))
    .with([P.when(isNumberCell), P._], ([matchedData]) => (
      <OpenCell
        aria-label={
          matchedData === 0
            ? `Open cell`
            : `Open cell with ${matchedData} adjacent cells`
        }
        onClick={handleClickNumberCell}
      >
        <MinesNumber value={matchedData} />
      </OpenCell>
    ))
    .with(['Mine', 'lose'], () => (
      <OpenCell aria-label={`Revealed mine`}>
        <MineIcon />
      </OpenCell>
    ))
    .with(['FlaggedEmpty', 'lose'], () => (
      <OpenCell aria-label={`Flagged cell with no mine`}>
        <CrossedMineIcon />
      </OpenCell>
    ))
    .with(['Mine', 'win'], () => (
      <ClosedCell aria-label={`Flagged cell`} isFlagged>
        <FlagIcon />
      </ClosedCell>
    ))
    .with([P.when(isFlagged), P._], () => (
      <ClosedCell
        aria-label={`Flagged cell`}
        onContextMenu={preventDefault(handleFlagCell)}
        isFlagged
        {...longTouchProps}
      >
        <FlagIcon />
      </ClosedCell>
    ))
    .otherwise(() => (
      <ClosedCell
        aria-label={`Unrevealed cell`}
        disabled={isFlagged(cellData)}
        isFlagged={false}
        onContextMenu={preventDefault(handleFlagCell)}
        onClick={handleClickCell}
        {...longTouchProps}
      />
    ));
});
Cell.displayName = 'Cell';

const openCellStyle = css`
  border-color: grey;
  border-style: solid;
  border-width: 0;
  border-top-width: 1px;
  border-left-width: 1px;
`;

export const StyledCell = styled.button.attrs({ 'data-testid': 'cell' })`
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  outline: none;
  background: none;
`;

export const OpenCell = styled(StyledCell).attrs({
  'data-open': true,
})<{ exploded?: boolean }>`
  ${openCellStyle}
  ${({ exploded = false }) =>
    exploded &&
    css`
      background-color: red;
    `}

  & > * {
    margin: -1px 0 0 -1px;
  }
`;

const notFlaggedCellStyle = css`
  &:active:not(:disabled) {
    ${openCellStyle}
  }
`;

export const ClosedCell = styled(StyledCell).attrs({
  'data-open': false,
})<{ isFlagged: boolean }>`
  ${shadow}

  ${(props) => (props.isFlagged ? null : notFlaggedCellStyle)}
`;

const FlagIcon = styled.img.attrs({ src: flagImage, alt: 'flag' })`
  width: 18px;
  height: 18px;
`;

const MineIcon = styled.img.attrs({ src: mineImage, alt: 'mine' })`
  width: 21px;
  height: 21px;
`;

const CrossedMineIcon = styled.img.attrs({
  src: crossedMineImage,
  alt: 'crossed mine',
})`
  width: 21px;
  height: 21px;
`;
