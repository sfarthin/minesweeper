/* global process */

const chalk = require('chalk');
const BOMB = 'B';
const WON = 2;
const LOST = 1;
const write = msg => process.stdout.write(String(msg));

function GameBoard(size) {
  const totalBoxes = size * size;
  const totalBombs = Math.floor(totalBoxes / 10);
  const board = new Array(totalBoxes);
  let isFinished = false; // false, WON, LOST

  /**
   * Methods
   */
  function toRowColumn(index) {
    const row = Math.floor(index / size);
    const col = index % size;
    return { row, col };
  }

  function toIndex({ row, col }) {
    // When grabbing surrounding boxes or taking input, lets
    // be permissive what can be entereed.
    if (row > size || col > size || row < 0 || col < 0) {
      return null;
    }
    return row * size + col;
  }

  function get({ row, col }) {
    return board[toIndex({ row, col })];
  }

  function printPiece(type) {
    switch (type) {
      case 'B':
        return chalk.bold.bgRed.white(type);
      case 0:
        return chalk.bold.bgWhite.blueBright(type);
      case 1:
        return chalk.bold.bgWhite.blue(type);
      case 2:
        return chalk.bold.bgWhite.green(type);
      case 3:
        return chalk.bold.bgWhite.yellow(type);
      case 4:
        return chalk.bold.bgWhite.magenta(type);
      default:
        return chalk.bold.bgWhite.red(type);
    }
  }

  function print() {
    /** Column Header **/
    write('\n      ');
    for (let col = 0; col < size; col++) {
      if (col >= 9) {
        write(col + 1 + ' ');
      } else {
        write(col + 1 + '  ');
      }
    }
    write('\n   ');
    for (let col = 0; col < size; col++) {
      write('---');
    }
    write('--\n');

    for (let row = 0; row < size; row++) {
      /** Row Lead **/
      if (row >= 9) {
        write(row + 1 + ' |');
      } else {
        write(' ' + (row + 1) + ' |');
      }

      /** Print Board values */
      for (let col = 0; col < size; col++) {
        const { isVisible, type } = get({ col, row });
        if (!isVisible && !isFinished) {
          write(chalk.bgWhite('  ') + chalk.bgWhiteBright(' '));
        } else {
          // Should be a number or the letter B
          write(chalk.bgWhite('  ') + printPiece(type));
        }
      }

      write(chalk.bgWhite(' '));

      write('\n');

      /** Row Lead for empty row **/
      write('   |');

      /** Print row of white */
      for (let col = 0; col < size; col++) {
        write(chalk.bgWhite('   '));
      }
      write(chalk.bgWhite(' '));
      write('\n');
    }
    write('\n');
  }

  function getSurroundingBombCount(box) {
    const numBombs = getSurroundingBoxes(box).filter(
      ({ type }) => type === BOMB
    ).length;

    return numBombs;
  }

  function markVisible(box) {
    box.isVisible = true;

    if (box.type === 0) {
      // To prevent infinite loops, we keep track of
      // the boxes we've seen.
      const boxesSeen = new Set([box.id]);

      let boxesToMark = getSurroundingBoxes(box).filter(
        b => !boxesSeen.has(b.id) && !b.isVisible
      );

      while (boxesToMark.length) {
        const box = boxesToMark.pop();
        box.isVisible = true;
        boxesSeen.add(box.id);

        if (box.type === 0) {
          boxesToMark = boxesToMark.concat(
            getSurroundingBoxes(box).filter(
              b => !boxesSeen.has(b.id) && !b.isVisible
            )
          );
        }
      }
    }
  }

  function getSurroundingBoxes({ row, col }) {
    let surrounding = [
      get({ row: row - 1, col }),
      get({ row: row + 1, col }),
      get({ row, col: col - 1 }),
      get({ row, col: col + 1 }),
      get({ row: row + 1, col: col + 1 }),
      get({ row: row - 1, col: col + 1 }),
      get({ row: row - 1, col: col - 1 }),
      get({ row: row + 1, col: col - 1 })
    ];
    return surrounding.filter(b => !!b);
  }

  function select({ row, col }) {
    const box = get({ row, col });

    // If type is 0, then select all items surrounding it
    markVisible(box);

    // See if we lost
    if (box.type === 'B') {
      isFinished = LOST;
    }

    // See if we won
    const nonVisibleElementLeft = board.find(
      e => !e.isVisible && e.type !== BOMB
    );
    if (!nonVisibleElementLeft) {
      isFinished = WON;
    }
  }

  /**
   * Reset
   */

  function reset() {
    isFinished = false;

    for (let i = 0; i < totalBoxes; i++) {
      const { row, col } = toRowColumn(i);
      board[i] = {
        id: i,
        row,
        col,
        isVisible: false,
        type: null
      };
    }

    // Place bombs
    let bombsPlaced = 0;
    while (bombsPlaced <= totalBombs) {
      const randomIndex = Math.floor(Math.random() * totalBoxes);

      if (board[randomIndex].type !== BOMB) {
        board[randomIndex].type = BOMB;
      }

      bombsPlaced++;
    }

    // Update the rest of the boxes
    for (let i = 0; i < totalBoxes; i++) {
      if (!board[i].type) {
        board[i].type = getSurroundingBombCount(toRowColumn(i));
      }
    }
  }

  reset();

  return {
    reset,
    print,
    select,
    isSuccessful: () => isFinished === WON,
    isFinished: () => !!isFinished
  };
}

module.exports = GameBoard;
