import { SIZE } from './constants';
import Utils from './Utils';
import Locations from './Locations';

interface IPieceParams {
  x: number;
  y: number;
  type?: string;
  direction?: string;
  next?: Piece | null;
  prev?: Piece | null;
};

interface IPiece {
  next: Piece | null;
  prev: Piece | null;
  x: number;
  y: number;
  el: HTMLDivElement;
  direction: string;
  type: string;
  garden: HTMLDivElement;

  /**
   * Beállítja a típust.
   * @param type {string} - a beállítandó típus
   * 1. A this.type tulajdonságot beállítja a kapott type értékre.
   * 2. Meghívja a this.applyClass metódust a változtatások érvényesítéséhez.
   */
  setType(type: string): void;

  /**
   * Osztályokat állít be a this.el HTML elemre.
   * 1. A this.el.className -et üres string -re állítja.
   * 2. A this.el.classList.add metódussal hozzáad három új osztályt:
   * 'cell', this.type, this.direction
   */
  applyClass(): void;

  /**
   * Megállapítja, hogy ütközött-e a kígyó darabja valamivel.
   * @param node {Piece}
   * @returns {boolean}
   * Ha a node null, akkor false értékkel tér vissza, 
   * Ha nem, akkor akkor tér vissza true -val, ha a this.x egyenlő a node.x -el 
   * és a this.y egyenlő a node.y -al.
   */
  isCollidingWith(node: Piece | null): boolean;
}

/**
 * FELADAT!
 * Pótold a hiányzó tulajdonságokat és metódusokat az interfész alapján.
 */
export default class Piece implements IPiece {

  //feladat A-Balint
  next: Piece | null;
  prev: Piece | null;
  x: number;
  y: number;
  el: HTMLDivElement;
  direction: string;
  type: string;
  garden: HTMLDivElement;

  constructor({
    x,
    y,
    type = 'body',
    direction = 'RIGHT',
    next = null,
    prev = null,
  }: IPieceParams) {
    this.direction = direction;
    this.type = type;
    this.x = x;
    this.y = y;
    this.el = document.createElement('div');
    this.next = next;
    this.prev = prev;
    // Enable for a neat effect
    // this.el.innerHTML = "&#10096;";
    this.setType(type);
    this.setPos(this.x, this.y);
    this.garden = (document.getElementById('garden') as HTMLDivElement);
    // this.applyClass();
    this.garden.appendChild(this.el);
  }

  //feladat A-Balint
  setType(type: string): void {
    this.type = type;
    this.applyClass();
  };

  //feladat A-Balint
  applyClass(): void {
    this.el.className = '';
    this.el.classList.add('cell', this.type, this.direction);
  };

  //feladat A-Balint
  isCollidingWith(node: Piece | null): boolean {
    if (node === null) {
      return false;
    } else {
      if (this.x === node.x && this.y === node.y) {
        return true;
      } else {
        return false;
      }
    }
  };

  bend(headDirection: string) {
    if (this.direction !== headDirection) {
      this.el.className = '';
      this.el.classList.add(
        'cell',
        this.type,
        headDirection,
        `${headDirection}-${this.direction}`
      );
      this.direction = headDirection;
    }
  }

  setPos(x: number, y: number): void {
    // CSS move the element
    this.el.style.top = `${y}px`;
    this.el.style.left = `${x}px`;

    // this.el.style.transform = `translate(${x}px, ${y}px)`;

    // reset CSS classnames basically
    this.applyClass();

    // Save the location of this piece to occupied spaces
    // But don't do this, if we are the food or head because;
    // - Head cannot collide with itself
    // - We want to collide with food :)
    if (this.type !== 'head' && this.type !== 'food' && this.type !== 'golden') {
      Locations.set(x, y);
    }
  }

  move(x: number, y: number, direction: string = 'RIGHT'): void {
    let X = x;
    let Y = y;

    // Transition through walls
    if (x < 0) {
      X = Utils.snap(this.garden.clientWidth) - SIZE;
    } else if (y < 0) {
      Y = Utils.snap(this.garden.clientHeight) - SIZE;
    } else if (x >= Utils.snap(this.garden.clientWidth)) {
      X = 0;
    } else if (y >= Utils.snap(this.garden.clientHeight)) {
      Y = 0;
    }

    // Save the old direction
    const tDirection = this.direction;
    // Set new direction of the piece
    this.direction = direction;
    // Move HTML Element to new spot
    this.setPos(X, Y);
    // If there is a next piece move it to old position
    if (this.next !== null) {
      // If this piece is a head piece, immediate piece should receive heads current
      // direction instead of old one this is needed to have a fluid motion
      this.next.move(this.x, this.y, this.type === 'head' ? this.direction : tDirection);
    } else {
      // We are the last piece, previous position
      // is now empty, clear it
      Locations.remove(this.x, this.y);
    }

    // if I"m part of body and no one is following me
    // then I must be the tail
    if (this.next === null && this.type === 'body') {
      this.el.classList.add('tail');
    }

    // if me and the piece following me are at the same spot
    // then piece following me must be the food we just swallowed
    if (this.next !== null && this.next.x === X && this.next.y === Y) {
      this.next.el.classList.add('gulp');
    }

    // Bendy corners
    if (this.next !== null && this.direction !== this.next.direction) {
      this.el.classList.add(`${this.direction}-${this.next.direction}`);
    }

    // store new values
    this.x = X;
    this.y = Y;
  }



  remove(): void {
    // Remove the piece, it"s location and HTML element
    // This is needed to free up memory
    Utils.removeNode(this.el);
    Locations.remove(this.x, this.y);

    // Do the same for all linked pieces
    if (this.next) {
      this.next.remove();
      this.next = null;
    }
  }
}
