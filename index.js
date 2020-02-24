#!/usr/bin/env node

const readline = require('readline');
const GameBoard = require('./Gameboard');
const log = console.log;
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/* global process */

function q(msg) {
  return new Promise(res =>
    rl.question(msg, answer => {
      res(answer);
    })
  );
}

async function requestPosition() {
  const answer = await q(
    `\nWhere do you want to select next?\n(For example, to select row 2, column 4, type "2,4")\n\n`
  );

  const nums = answer.split(',').map(Number);

  return { row: nums[0] - 1, col: nums[1] - 1 };
}

async function main(size) {
  if (!size) {
    const answer = await q(`What size of board? (e.g. 4 or 10 or 20\n\n`);
    size = answer;
  }

  let board = GameBoard(Number(size));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (board.isFinished()) {
      board.print();
      const answer = await q(
        `\n${
          board.isSuccessful()
            ? chalk.green(`Congrats! You win!`)
            : chalk.red(`BOOM... Nice try`)
        }\nLet's try again, what size board this time?\n\n`
      );

      board.reset(Number(answer));
    }

    // Show board.
    board.print();
    try {
      const { row, col } = await requestPosition();
      board.select({ row, col });
    } catch (e) {
      log('Invalid Input!');
    }
  }
}

// Parse arguments into options object
const size = Number(process.argv.slice(2).join(''));
main(size)
  .then(() => {
    rl.close();
  })
  .catch(e => {
    console.error(e);
    rl.close();
  });
